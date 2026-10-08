# YojanaSetu (योजना सेतु) 🇮🇳
### AI-First Indian Government Schemes Discovery & Eligibility Platform

[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![FAISS](https://img.shields.io/badge/FAISS-Vector_Search-0052CC)](https://github.com/facebookresearch/faiss)
[![SentenceTransformers](https://img.shields.io/badge/Embeddings-all--MiniLM--L6--v2-FF9900)](https://www.sbert.net/)
[![Google Gemini](https://img.shields.io/badge/LLM-Gemini_Flash-4285F4?logo=google)](https://aistudio.google.com/)

YojanaSetu is an AI-first citizen empowerment platform inspired by Government of India digital initiatives (such as MyScheme and Digital India), built with a premium, modern visual identity, tasteful 3D visual effects, and a grounded Retrieval-Augmented Generation (RAG) architecture.

---

## 🏛️ Vision & Key Features

1. **AI Scheme Discovery**: Semantic hybrid search powered by SentenceTransformers (`all-MiniLM-L6-v2`) and FAISS vector index.
2. **Grounded AI Assistant**: Conversational assistant that draws strictly from verified government scheme circulars, preventing hallucinations.
3. **Voice Input Support**: Browser Web Speech API integration allowing citizens to speak their questions in English or Hinglish.
4. **Multi-Step Eligibility Wizard**: Comprehensive demographic, occupational, and asset-based eligibility calculator with match percentage scoring and reason breakdown.
5. **Interactive 3D Visuals**: Tasteful Three.js holographic citizen-bridge ("Setu") canvas, 3D card tilt effects, and micro-interactions designed to impress in demonstrations while staying fast and professional.
6. **Central & State Scheme Directory**: Filterable database of 24+ central flagship schemes (PM-KISAN, Ayushman Bharat, PMAY, MUDRA, PM Vishwakarma, Sukanya Samriddhi, and more).
7. **National Welfare Analytics Dashboard**: Sector distribution breakdowns, demographic coverage metrics, and Direct Benefit Transfer (DBT) statistics.

---

## 🏗️ Architecture

```
User Query (Text or Voice)
       ↓
Next.js 16 (App Router + Tailwind CSS + Three.js + Framer Motion)
       ↓  (REST API)
FastAPI Backend
       ↓
RAG Engine (Sentence Transformers: all-MiniLM-L6-v2)
       ↓
FAISS Vector Index (Normalized Cosine Dot-Product)
       ↓
Top Relevant Government Schemes Retrieved (Authentic Grounding)
       ↓
Google Gemini API (or Grounded Synthesizer Fallback)
       ↓
Structured Citizen Response with Official Portal Links
```

---

## 📁 Project Structure

```
yojanasetu/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # Home Page with 3D Hero & Search
│   │   │   ├── layout.tsx          # Root Layout & Metadata
│   │   │   ├── globals.css         # Glassmorphism, Navy/Saffron Theme
│   │   │   ├── schemes/
│   │   │   │   ├── page.tsx        # Directory with Search & Category Filters
│   │   │   │   └── [id]/page.tsx   # Detailed Scheme Dossier & Official Source
│   │   │   ├── assistant/page.tsx  # Conversational AI with Voice Input
│   │   │   ├── eligibility/page.tsx # Multi-Step Eligibility Wizard
│   │   │   ├── analytics/page.tsx  # Scheme Statistics & Visual Dashboards
│   │   │   ├── login/page.tsx      # Sign In UI
│   │   │   └── signup/page.tsx     # Registration UI
│   │   ├── components/
│   │   │   ├── layout/             # Navbar, Footer
│   │   │   ├── home/               # HeroSection, Hero3DVisual, Categories, HowItWorks
│   │   │   ├── schemes/            # SchemeCard, SchemeFilterBar
│   │   │   ├── chat/               # ChatInterface, VoiceInputButton
│   │   │   ├── eligibility/        # EligibilityWizard
│   │   │   ├── analytics/          # AnalyticsDashboard
│   │   │   └── ui/                 # TiltCard, Badge
│   │   └── lib/
│   │       ├── api.ts              # REST Client for FastAPI
│   │       ├── types.ts            # TypeScript Definitions
│   │       └── utils.ts            # Formatting & Category Colors
│   └── package.json
│
├── backend/
│   ├── main.py                     # FastAPI Endpoints, CORS & Database API
│   ├── database.py                 # SQLite 3 Engine, FTS5 Index, Bookmarks & Auditing
│   ├── rag_engine.py               # Vector Search, FAISS, Gemini & Eligibility Logic
│   ├── models.py                   # Pydantic Schemas & Database Models
│   ├── yojanasetu.db               # SQLite 3 Database File (Persistent Storage)
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
│
├── data/
│   └── schemes.json                # Seed Dataset of 24 Flagship Schemes
├── README.md
└── .gitignore
```

---

## 🚀 Quickstart Guide

### 1. Backend Setup (FastAPI + RAG)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Optional: To enable live Google Gemini responses, add your API key in `backend/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8000
HOST=0.0.0.0
```
*(If no key is configured, YojanaSetu automatically uses its high-quality grounded RAG template generator without failing!)*

Run the backend server:
```bash
./venv/bin/uvicorn main:app --reload --port 8000
```
API Documentation will be live at: `http://localhost:8000/docs`

---

### 2. Frontend Setup (Next.js)

```bash
cd frontend
npm install
npm run dev
```

The web application will be live at: `http://localhost:3000`

---

## 🛡️ Trust & Official Sources

YojanaSetu does not hallucinate government benefits or create arbitrary official links. All schemes link directly to verified Government of India portals including:
- PM-KISAN: `https://pmkisan.gov.in`
- Ayushman Bharat PM-JAY: `https://pmjay.gov.in`
- Pradhan Mantri Awas Yojana: `https://pmay-urban.gov.in`
- National Scholarship Portal: `https://scholarships.gov.in`
- PM Vishwakarma: `https://pmvishwakarma.gov.in`
- PM MUDRA: `https://www.mudra.org.in`
- Sukanya Samriddhi Yojana: `https://www.indiapost.gov.in`
