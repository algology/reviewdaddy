import { Database } from "./database.types";

// Database row types
export type DBFilterConfig =
  Database["public"]["Tables"]["filter_configs"]["Row"] & {
    filter_keywords: DBFilterKeyword[];
  };
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
