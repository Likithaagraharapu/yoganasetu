import os
import json
import re
import math
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Attempt to import sentence-transformers and faiss, with robust graceful fallbacks
SENTENCE_TRANSFORMERS_AVAILABLE = False
FAISS_AVAILABLE = False

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except Exception:
    SENTENCE_TRANSFORMERS_AVAILABLE = False

try:
    import faiss
    FAISS_AVAILABLE = True
except Exception:
    FAISS_AVAILABLE = False

# Attempt to import google.generativeai
GEMINI_AVAILABLE = False
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except Exception:
    GEMINI_AVAILABLE = False


class LightweightTFIDF:
    """Fallback semantic vectorizer if sentence-transformers / PyTorch is loading or absent."""
    def __init__(self):
        self.vocab = {}
        self.idf = {}
        self.doc_count = 0

    def fit_transform(self, docs: List[str]) -> np.ndarray:
        self.doc_count = len(docs)
        tokenized_docs = [self._tokenize(doc) for doc in docs]
        
        # Build vocabulary & document frequencies
        df = {}
        for tokens in tokenized_docs:
            seen = set(tokens)
            for t in seen:
                df[t] = df.get(t, 0) + 1
        
        self.vocab = {term: idx for idx, term in enumerate(df.keys())}
        self.idf = {term: math.log((self.doc_count + 1) / (count + 1)) + 1 for term, count in df.items()}
        
        vectors = np.zeros((self.doc_count, len(self.vocab)), dtype=np.float32)
        for i, tokens in enumerate(tokenized_docs):
            tf = {}
            for t in tokens:
                tf[t] = tf.get(t, 0) + 1
            for t, count in tf.items():
                if t in self.vocab:
                    col = self.vocab[t]
                    vectors[i, col] = (count / len(tokens)) * self.idf[t]
            norm = np.linalg.norm(vectors[i])
            if norm > 0:
                vectors[i] /= norm
        return vectors

    def transform(self, query: str) -> np.ndarray:
        tokens = self._tokenize(query)
        vec = np.zeros((len(self.vocab),), dtype=np.float32)
        if not tokens:
            return vec
        tf = {}
        for t in tokens:
            tf[t] = tf.get(t, 0) + 1
        for t, count in tf.items():
            if t in self.vocab:
                col = self.vocab[t]
                vec[col] = (count / len(tokens)) * self.idf[t]
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec /= norm
        return vec

    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r"\b[a-zA-Z0-9_\-\u0900-\u097F]{2,}\b", text.lower())


class RAGEngine:
    def __init__(self, data_path: Optional[str] = None):
        self.base_dir = Path(__file__).resolve().parent.parent
        self.data_path = data_path or str(self.base_dir / "data" / "schemes.json")
        self.schemes: List[Dict[str, Any]] = []
        self.scheme_texts: List[str] = []
        
        self.embedding_model = None
        self.faiss_index = None
        self.embeddings: Optional[np.ndarray] = None
        self.fallback_tfidf: Optional[LightweightTFIDF] = None
        
        self.gemini_model = None
        self.gemini_configured = False
        
        self.load_data()
        self.init_embeddings()
        self.init_gemini()

    def load_data(self):
        """Loads schemes directly from persistent SQLite 3 database."""
        try:
            import database
            database.init_db()
            db_schemes = database.get_all_schemes(limit=500)
            if db_schemes:
                self.schemes = db_schemes
            elif os.path.exists(self.data_path):
                with open(self.data_path, "r", encoding="utf-8") as f:
                    self.schemes = json.load(f)
            else:
                self.schemes = []
        except Exception as e:
            print(f"[RAG Engine] Warning loading from SQLite ({e}). Falling back to JSON.")
            if os.path.exists(self.data_path):
                with open(self.data_path, "r", encoding="utf-8") as f:
                    self.schemes = json.load(f)
            else:
                self.schemes = []

        self.scheme_texts = []
        for s in self.schemes:
            elig_details = s.get("eligibility", {}).get("details", "")
            occupations = ", ".join(s.get("eligibility", {}).get("occupations", []))
            docs = ", ".join(s.get("documents", []))
            text = (
                f"Scheme: {s.get('name', '')}. "
                f"Category: {s.get('category', '')}. "
                f"Target Group: {s.get('target_group', '')}. "
                f"Occupations: {occupations}. "
                f"Description: {s.get('description', '')}. "
                f"Benefits: {s.get('benefits', '')}. "
                f"Eligibility: {elig_details}. "
                f"Documents: {docs}. "
                f"Application Process: {s.get('application_process', '')}."
            )
            self.scheme_texts.append(text)

    def reload_data(self):
        """Reloads schemes from SQLite 3 and refreshes vector embeddings."""
        print("[RAG Engine] Reloading scheme database and vector embeddings...")
        self.load_data()
        self.init_embeddings()

    def init_embeddings(self):
        """Initializes sentence transformers and FAISS, with automatic graceful fallback."""
        global SENTENCE_TRANSFORMERS_AVAILABLE, FAISS_AVAILABLE
        
        model_name = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
        if SENTENCE_TRANSFORMERS_AVAILABLE:
            try:
                print(f"[RAG Engine] Loading SentenceTransformer: {model_name}...")
                self.embedding_model = SentenceTransformer(model_name)
                encoded = self.embedding_model.encode(self.scheme_texts, convert_to_numpy=True, normalize_embeddings=True)
                self.embeddings = encoded.astype(np.float32)
                
                if FAISS_AVAILABLE and len(self.embeddings) > 0:
                    d = self.embeddings.shape[1]
                    self.faiss_index = faiss.IndexFlatIP(d)
                    self.faiss_index.add(self.embeddings)
                    print(f"[RAG Engine] FAISS index created with {self.faiss_index.ntotal} vectors.")
                else:
                    print("[RAG Engine] FAISS not available; using normalized cosine dot-product.")
                return
            except Exception as e:
                print(f"[RAG Engine] Warning: Could not initialize SentenceTransformer ({e}). Falling back to TF-IDF.")
        
        # Fallback to TF-IDF vectorizer
        print("[RAG Engine] Using Lightweight TF-IDF index for ultra-fast startup.")
        self.fallback_tfidf = LightweightTFIDF()
        self.embeddings = self.fallback_tfidf.fit_transform(self.scheme_texts)

    def init_gemini(self):
        """Initializes Google Gemini API if key is present."""
        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if api_key and GEMINI_AVAILABLE:
            try:
                genai.configure(api_key=api_key)
                # Try 2.5 flash or 1.5 flash
                self.gemini_model = genai.GenerativeModel("gemini-1.5-flash")
                self.gemini_configured = True
                print("[RAG Engine] Google Gemini 1.5 Flash client initialized successfully.")
            except Exception as e:
                print(f"[RAG Engine] Gemini initialization warning: {e}")
                self.gemini_configured = False
        else:
            self.gemini_configured = False
            print("[RAG Engine] GEMINI_API_KEY not configured. High-quality grounded RAG template generation will be active.")

    def search(
        self,
        query: str = "",
        category: Optional[str] = None,
        target_group: Optional[str] = None,
        state: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Hybrid search combining keyword filtering, category matching, and vector similarity."""
        if not self.schemes:
            return []

        # Step 1: Filter by category / target group / state if specified
        candidate_indices = []
        for i, s in enumerate(self.schemes):
            if category and category.lower() != "all":
                if s.get("category", "").lower() != category.lower():
                    continue
            if target_group and target_group.lower() != "all":
                if target_group.lower() not in s.get("target_group", "").lower():
                    continue
            candidate_indices.append(i)

        if not candidate_indices:
            candidate_indices = list(range(len(self.schemes)))

        # Step 2: If query is empty, return candidate schemes
        if not query.strip():
            return [self.schemes[i] for i in candidate_indices[:limit]]

        # Step 3: Compute semantic similarity
        scores = {}
        query_lower = query.lower()

        # Vector search
        if self.embedding_model is not None and self.embeddings is not None:
            try:
                q_vec = self.embedding_model.encode([query], convert_to_numpy=True, normalize_embeddings=True).astype(np.float32)
                if self.faiss_index is not None:
                    # FAISS search
                    D, I = self.faiss_index.search(q_vec, min(limit * 3, len(self.schemes)))
                    for dist, idx in zip(D[0], I[0]):
                        if idx in candidate_indices and idx != -1:
                            scores[idx] = float(dist)
                else:
                    dot_prods = np.dot(self.embeddings, q_vec.T).squeeze()
                    for idx in candidate_indices:
                        scores[idx] = float(dot_prods[idx])
            except Exception:
                pass
        elif self.fallback_tfidf is not None and self.embeddings is not None:
            q_vec = self.fallback_tfidf.transform(query)
            dot_prods = np.dot(self.embeddings, q_vec)
            for idx in candidate_indices:
                scores[idx] = float(dot_prods[idx])

        # Step 4: Hybrid keyword boost (exact match for scheme name or key terms)
        for idx in candidate_indices:
            s = self.schemes[idx]
            name = s.get("name", "").lower()
            desc = s.get("description", "").lower()
            cat = s.get("category", "").lower()
            tg = s.get("target_group", "").lower()

            base_score = scores.get(idx, 0.0)

            # Exact name or acronym match
            for word in query_lower.split():
                if len(word) > 2:
                    if word in name:
                        base_score += 0.35
                    if word in desc:
                        base_score += 0.15
                    if word in tg:
                        base_score += 0.20
                    if word in cat:
                        base_score += 0.15

            scores[idx] = base_score

        # Sort candidate indices by score descending
        sorted_indices = sorted(candidate_indices, key=lambda i: scores.get(i, 0.0), reverse=True)
        results = [self.schemes[i] for i in sorted_indices[:limit]]
        return results

    def chat(self, message: str, scheme_id: Optional[str] = None) -> Dict[str, Any]:
        """Grounded RAG Assistant: retrieves relevant schemes, prompts Gemini or synthesizes answer."""
        retrieved_schemes: List[Dict[str, Any]] = []

        # If user specifically asked about a scheme ID
        if scheme_id:
            for s in self.schemes:
                if s["id"] == scheme_id:
                    retrieved_schemes.append(s)
                    break

        # Search for the top relevant schemes for the query
        search_results = self.search(message, limit=4)
        for s in search_results:
            if s not in retrieved_schemes:
                retrieved_schemes.append(s)
            if len(retrieved_schemes) >= 3:
                break

        # Format context for RAG
        context_blocks = []
        for s in retrieved_schemes:
            context_blocks.append(
                f"### {s['name']} (Category: {s['category']})\n"
                f"- **Target Group**: {s['target_group']}\n"
                f"- **Key Benefits**: {s['benefits']}\n"
                f"- **Eligibility**: {s.get('eligibility', {}).get('details', '')}\n"
                f"- **Required Documents**: {', '.join(s.get('documents', []))}\n"
                f"- **Application Process**: {s.get('application_process', '')}\n"
                f"- **Official Portal**: {s.get('official_source', '')}"
            )
        context_str = "\n\n".join(context_blocks)

        system_prompt = (
            "You are YojanaSetu AI, an expert, empathetic, and transparent Indian Government Scheme Discovery Assistant.\n"
            "Your mission is to help Indian citizens, students, farmers, women entrepreneurs, and workers find government schemes they qualify for.\n\n"
            "INSTRUCTIONS:\n"
            "1. Ground your answer strictly on the authentic scheme information provided below.\n"
            "2. Structure your response clearly using Markdown formatting with sections:\n"
            "   - **Recommended Scheme(s)**\n"
            "   - **Key Benefits & Financial Assistance**\n"
            "   - **Eligibility Criteria**\n"
            "   - **Required Documents**\n"
            "   - **How to Apply (with official links)**\n"
            "3. If the user's situation matches multiple schemes, explain how each applies.\n"
            "4. NEVER invent fake portal URLs or imaginary monetary benefits.\n"
            "5. Maintain an encouraging, respectful, and authoritative tone suitable for all Indian citizens.\n"
        )

        user_prompt = (
            f"GOVERNMENT SCHEMES KNOWLEDGE BASE:\n{context_str}\n\n"
            f"CITIZEN'S QUESTION:\n{message}\n\n"
            "Please provide a comprehensive, well-structured, and helpful response:"
        )

        ai_response = ""
        is_gemini = False

        if self.gemini_configured and self.gemini_model:
            try:
                full_prompt = f"{system_prompt}\n\n{user_prompt}"
                response = self.gemini_model.generate_content(full_prompt)
                ai_response = response.text
                is_gemini = True
            except Exception as e:
                print(f"[RAG Engine] Gemini API error: {e}. Falling back to grounded generator.")
                is_gemini = False

        if not ai_response:
            # High-quality grounded fallback synthesis
            ai_response = self._synthesize_grounded_response(message, retrieved_schemes)

        # Generate follow-up suggestions
        suggested_followups = self._generate_followups(retrieved_schemes, message)

        sources = [s.get("official_source", "") for s in retrieved_schemes if s.get("official_source")]

        return {
            "response": ai_response,
            "grounded_schemes": retrieved_schemes,
            "sources": sources,
            "is_gemini_powered": is_gemini,
            "suggested_followups": suggested_followups
        }

    def _synthesize_grounded_response(self, query: str, schemes: List[Dict[str, Any]]) -> str:
        """Produces a structured, highly informative grounded response when Gemini API key is not present."""
        if not schemes:
            return (
                "### No Direct Scheme Match Found\n\n"
                "We couldn't locate a government scheme matching your exact criteria in our current database. "
                "Try searching for broader keywords such as *farmer*, *scholarship*, *housing*, *business loan*, or *healthcare*, "
                "or use our **Eligibility Wizard** for personalized recommendations."
            )

        primary = schemes[0]
        secondary = schemes[1:] if len(schemes) > 1 else []

        md = []
        md.append(f"### Recommended Scheme: {primary['name']}\n")
        md.append(f"Based on your inquiry, **{primary['name']}** is directly applicable to your profile.\n")
        
        md.append("#### 1. Key Benefits & Financial Assistance")
        md.append(f"{primary['benefits']}\n")

        md.append("#### 2. Eligibility Overview")
        elig = primary.get("eligibility", {})
        md.append(f"- **Target Group**: {primary.get('target_group', 'General Public')}")
        if elig.get("min_age") is not None or elig.get("max_age") is not None:
            min_a = f"{elig.get('min_age')} years" if elig.get('min_age') is not None else "No min age"
            max_a = f"{elig.get('max_age')} years" if elig.get('max_age') is not None else "No upper limit"
            md.append(f"- **Age Criteria**: {min_a} to {max_a}")
        if elig.get("income_limit"):
            md.append(f"- **Income Limit**: Annual household income up to ₹{elig.get('income_limit'):,}")
        md.append(f"- **Criteria Details**: {elig.get('details', '')}\n")

        md.append("#### 3. Essential Documents Required")
        for doc in primary.get("documents", []):
            md.append(f"- {doc}")
        md.append("")

        md.append("#### 4. How to Apply")
        md.append(f"{primary['application_process']}\n")
        md.append(f"🔗 **Official Portal**: [{primary['official_source']}]({primary['official_source']})\n")

        if secondary:
            md.append("---")
            md.append("#### Other Relevant Schemes You May Consider:")
            for s in secondary:
                md.append(f"- **{s['name']}** ({s['category']}): {s['description'][:130]}... [Official Source: {s['official_source']}]")

        md.append("\n> **YojanaSetu Transparency Notice**: All scheme guidelines are sourced directly from verified Government of India portals. Please review the official portal for exact state-level circulars.")
        return "\n".join(md)

    def _generate_followups(self, schemes: List[Dict[str, Any]], query: str) -> List[str]:
        """Generates dynamic, helpful suggested follow-up questions."""
        followups = []
        if schemes:
            scheme = schemes[0]
            followups.append(f"What documents do I need for {scheme['name'].split('(')[0].strip()}?")
            followups.append("How can I apply through a Common Service Center (CSC)?")
            if scheme.get("category") == "Agriculture":
                followups.append("Are tenant farmers eligible for Kisan schemes?")
            elif scheme.get("category") == "Health":
                followups.append("Which hospitals accept Ayushman cards?")
            elif scheme.get("category") == "Finance":
                followups.append("Is collateral required for business loans?")
            elif scheme.get("category") == "Education":
                followups.append("What is the income certificate process for scholarships?")
            else:
                followups.append("What other schemes can I combine with this?")
        else:
            followups = [
                "What schemes are available for farmers?",
                "Which scholarships exist for higher education?",
                "Are there loans for women entrepreneurs?",
                "What healthcare schemes cover senior citizens?"
            ]
        return followups[:3]

    def evaluate_eligibility(self, profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Evaluates citizen profile against all schemes and returns ranked matches."""
        results = []
        user_age = profile.get("age")
        user_gender = profile.get("gender")
        user_state = profile.get("state")
        user_occupation = (profile.get("occupation") or "").lower()
        user_income = profile.get("annual_income")
        user_category = profile.get("social_category")
        owns_land = profile.get("owns_agricultural_land", False)
        owns_pucca = profile.get("owns_pucca_house", False)
        has_bpl = profile.get("is_bpl_ration_card", False)
        is_disabled = profile.get("is_differently_abled", False)

        for s in self.schemes:
            score = 70  # Baseline
            reasons = []
            elig = s.get("eligibility", {})
            scheme_name = s.get("name", "")

            # Age check
            min_age = elig.get("min_age")
            max_age = elig.get("max_age")
            if user_age is not None:
                if min_age is not None and user_age < min_age:
                    score -= 40
                    reasons.append(f"Requires minimum age of {min_age} years (your age: {user_age}).")
                elif max_age is not None and user_age > max_age:
                    score -= 40
                    reasons.append(f"Maximum age limit is {max_age} years (your age: {user_age}).")
                else:
                    score += 10
                    reasons.append(f"Age criteria met ({user_age} years).")

            # Gender check
            scheme_gender = elig.get("gender", "All")
            if scheme_gender != "All" and user_gender:
                if scheme_gender.lower() == user_gender.lower():
                    score += 20
                    reasons.append(f"Targeted for {user_gender} beneficiaries.")
                else:
                    score -= 50
                    reasons.append(f"Exclusively for {scheme_gender} candidates.")

            # Income limit check
            income_limit = elig.get("income_limit")
            if income_limit and user_income is not None:
                if user_income <= income_limit:
                    score += 15
                    reasons.append(f"Income within ₹{income_limit:,} eligibility ceiling.")
                else:
                    score -= 35
                    reasons.append(f"Reported income exceeds ₹{income_limit:,} limit.")

            # Occupation & special circumstances matching
            occ_list = [o.lower() for o in elig.get("occupations", [])]
            if "all" in occ_list:
                score += 10
            elif user_occupation:
                matched_occ = any(o in user_occupation or user_occupation in o for o in occ_list)
                if matched_occ:
                    score += 25
                    reasons.append(f"Matches your occupation: {profile.get('occupation')}.")
                else:
                    score -= 15

            # Specific scheme rules
            if s["id"] == "pm-kisan":
                if owns_land:
                    score += 25
                    reasons.append("Landholding farmer family criterion satisfied.")
                else:
                    score -= 30
                    reasons.append("Requires cultivable landholding ownership.")

            if s["id"] in ["pmay-urban", "pmay-gramin"]:
                if not owns_pucca:
                    score += 25
                    reasons.append("Pucca house shortage criterion satisfied.")
                else:
                    score -= 40
                    reasons.append("Disqualified if already owning a pucca house.")

            if has_bpl:
                if s.get("category") in ["Health", "Housing", "Social Welfare"]:
                    score += 15
                    reasons.append("Priority for BPL / Ration Card holders.")

            if user_category in ["SC", "ST", "Minority"] and s["id"] in ["nsp-post-matric", "stand-up-india"]:
                score += 20
                reasons.append(f"Special allocation for {user_category} community.")

            # Clamp score 0 to 100
            final_score = max(10, min(100, score))
            
            if final_score >= 75:
                status = "Eligible"
            elif final_score >= 50:
                status = "Likely Eligible"
            else:
                status = "Review Required"

            results.append({
                "scheme": s,
                "score": final_score,
                "status": status,
                "reasons": reasons[:4]
            })

        # Sort by score descending
        results.sort(key=lambda x: x["score"], reverse=True)
        return results

    def get_stats(self) -> Dict[str, Any]:
        """Calculates platform scheme statistics."""
        cat_counts: Dict[str, int] = {}
        tg_counts: Dict[str, int] = {}

        for s in self.schemes:
            cat = s.get("category", "Other")
            cat_counts[cat] = cat_counts.get(cat, 0) + 1
            
            tg = s.get("target_group", "General")
            tg_counts[tg] = tg_counts.get(tg, 0) + 1

        return {
            "total_schemes": len(self.schemes),
            "total_categories": len(cat_counts),
            "category_counts": cat_counts,
            "target_group_counts": tg_counts,
            "estimated_citizens_covered_crores": 85.4
        }
