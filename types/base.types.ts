// Common shared types used across different type files
export interface BaseKeyword {
  id: string;
  term: string;
  match_exact: boolean;
}

export interface BaseFilterConfig {
  id: string;
  min_rating: number | null;
  max_rating: number | null;
  date_range: number | null;
  include_replies: boolean;
  match_all_keywords: boolean;
}

export interface BaseApp {
  id: string;
  name: string;
  developer: string;
  rating: number;
  reviews: number;
}
