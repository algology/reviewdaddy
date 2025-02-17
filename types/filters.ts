import { Database } from "./database.types";
import { BaseKeyword, BaseFilterConfig } from "./base.types";

// Database row types
export interface DBFilterConfig extends BaseFilterConfig {
  user_id: string;
  name: string | null;
  created_at: string;
  updated_at: string;
  filter_keywords: BaseKeyword[];
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

export interface ComponentKeywordFilter
  extends Omit<BaseKeyword, "match_exact"> {
  matchExact: boolean;
}
