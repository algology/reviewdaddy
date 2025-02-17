export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      apps: {
        Row: {
          id: string;
          play_store_id: string;
          name: string;
          developer: string;
          icon_url: string;
          current_rating: number;
          total_reviews: number;
          created_at: string;
          last_synced_at: string | null;
        };
        Insert: {
          id?: string;
          play_store_id: string;
          name: string;
          developer: string;
          icon_url: string;
          current_rating: number;
          total_reviews: number;
          created_at?: string;
          last_synced_at?: string | null;
        };
        Update: {
          id?: string;
          play_store_id?: string;
          name?: string;
          developer?: string;
          icon_url?: string;
          current_rating?: number;
          total_reviews?: number;
          created_at?: string;
          last_synced_at?: string | null;
        };
      };
      filter_configs: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string | null;
          match_all_keywords?: boolean;
          min_rating?: number | null;
          max_rating?: number | null;
          date_range?: number | null;
          include_replies?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string | null;
          match_all_keywords?: boolean;
          min_rating?: number | null;
          max_rating?: number | null;
          date_range?: number | null;
          include_replies?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      filter_keywords: {
        Row: {
          id: string;
          filter_config_id: string;
          term: string;
          match_exact: boolean;
        };
        Insert: {
          id?: string;
          filter_config_id: string;
          term: string;
          match_exact?: boolean;
        };
        Update: {
          id?: string;
          filter_config_id?: string;
          term?: string;
          match_exact?: boolean;
        };
      };
    };
  };
}
