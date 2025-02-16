// Database types
export interface DBFilterConfig {
  id: string;
  user_id: string;
  name: string;
  min_rating: number | null;
  max_rating: number | null;
  match_all_keywords: boolean;
  date_range: number | null;
  include_replies: boolean;
  created_at: string;
  updated_at: string;
  filter_keywords: DBFilterKeyword[];
}

export interface DBFilterKeyword {
  id: string;
  filter_config_id: string;
  term: string;
  match_exact: boolean;
}

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
  id?: string;
  term: string;
  matchExact: boolean;
}
