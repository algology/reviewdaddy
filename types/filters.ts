import { Database } from "./database.types";

// Database row types
export interface DBFilterConfig {
  id: string;
  user_id: string;
  name: string | null;
  match_all_keywords: boolean;
  min_rating: number | null;
  max_rating: number | null;
  date_range: number | null;
  include_replies: boolean;
  created_at: string;
  updated_at: string;
  filter_keywords: {
    id: string;
    term: string;
    match_exact: boolean;
  }[];
  app: {
    play_store_id: string;
  };
}

export type DBFilterKeyword =
  Database["public"]["Tables"]["filter_keywords"]["Row"];

// Component types
export interface ComponentFilterConfig {
  keywords: ComponentKeywordFilter[];
  matchAllKeywords: boolean;
  minRating: number;
  maxRating: number;
  dateRange: number;
  includeReplies: boolean;
}

export interface ComponentKeywordFilter {
  id?: string; // Optional for new keywords
  term: string;
  matchExact: boolean;
}
