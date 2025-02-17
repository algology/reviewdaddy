import { BaseKeyword } from "./base.types";

// Play Store API Types
export interface PlayStoreReview {
  id: string;
  userName: string;
  date: string;
  score: number;
  text: string | null;
  replyDate?: string;
  replyText?: string | null;
  thumbsUp: number;
  review_date?: string;
  rating?: number;
}

export interface PlayStoreApp {
  id: string;
  appId: string;
  title: string;
  name: string;
  icon: string;
  developer: string;
  score: number;
  rating: number;
  reviews: number;
  description: string;
  installs: string;
  lastUpdated: string;
}

export interface ReviewsResponse {
  data: PlayStoreReview[];
  nextPaginationToken?: string;
}

// Monitoring Types
export interface MonitoredApp {
  app: {
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
  filter_config: {
    id: string;
    min_rating: number | null;
    max_rating: number | null;
    date_range: number | null;
    include_replies: boolean;
    match_all_keywords: boolean;
    filter_keywords: {
      id: string;
      term: string;
      match_exact: boolean;
    }[];
  };
}

export interface MatchedReview {
  id: string;
  review: {
    id: string;
    rating: number;
    text: string;
    reply_text: string | null;
    reviewer_name: string;
    review_date: string;
    app: {
      name: string;
      icon_url: string;
    };
  };
  filter_config: {
    name: string;
    filter_keywords: BaseKeyword[];
  };
  matched_at: string;
}
