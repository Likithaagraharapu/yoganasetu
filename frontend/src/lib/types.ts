export interface EligibilityCriteria {
  min_age: number | null;
  max_age: number | null;
  occupations: string[];
  states: string[];
  gender: string;
  income_limit: number | null;
  details: string;
}

export interface Scheme {
  id: string;
  name: string;
  description: string;
  category: string;
  target_group: string;
  eligibility: EligibilityCriteria;
  benefits: string;
  documents: string[];
  application_process: string;
  official_source: string;
}

export interface SearchRequest {
  query: string;
  category?: string;
  target_group?: string;
  state?: string;
  limit?: number;
}

export interface SearchResponse {
  total: number;
  schemes: Scheme[];
  categories: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  grounded_schemes?: Scheme[];
  sources?: string[];
  is_gemini_powered?: boolean;
  suggested_followups?: string[];
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  scheme_id?: string;
}

export interface ChatResponse {
  response: string;
  grounded_schemes: Scheme[];
  sources: string[];
  is_gemini_powered: boolean;
  suggested_followups: string[];
}

export interface EligibilityProfile {
  name?: string;
  age?: number;
  gender?: string;
  state?: string;
  occupation?: string;
  annual_income?: number;
  social_category?: string;
  education?: string;
  is_differently_abled?: boolean;
  is_bpl_ration_card?: boolean;
  owns_pucca_house?: boolean;
  owns_agricultural_land?: boolean;
}

export interface EligibilityResultItem {
  scheme: Scheme;
  score: number;
  status: 'Eligible' | 'Likely Eligible' | 'Review Required';
  reasons: string[];
}

export interface EligibilityResponse {
  profile_summary: Record<string, unknown>;
  results: EligibilityResultItem[];
}

export interface StatsResponse {
  total_schemes: number;
  total_categories: number;
  category_counts: Record<string, number>;
  target_group_counts: Record<string, number>;
  estimated_citizens_covered_crores: number;
}

export interface BookmarkItem {
  bookmark_id: number;
  notes?: string | null;
  bookmarked_at: string;
  scheme: Scheme;
}

export interface DatabaseStats {
  database_engine: string;
  sqlite_version: string;
  database_path: string;
  file_size_bytes: number;
  file_size_kb: number;
  tables: {
    schemes: number;
    categories: number;
    bookmarks: number;
    eligibility_history: number;
    search_logs: number;
    chat_history: number;
  };
}

// -------------------------------------------------------------
// Citizen Authentication & Account Models
// -------------------------------------------------------------

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  state?: string | null;
  created_at?: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface SignupData {
  full_name: string;
  email: string;
  password: string;
  state?: string;
}

export interface LoginData {
  email: string;
  password: string;
  remember_me?: boolean;
}
