import { BaseKeyword } from "./base.types";

export interface AnalyticsData {
  reviewTrend: {
    date: string;
    totalReviews: number;
    matchedReviews: number;
  }[];
  ratingDistribution: {
    rating: number;
    count: number;
  }[];
  keywordMatches: {
    keyword: string;
    matches: number;
  }[];
}

export interface FilterConfig {
  id: string;
  min_rating: number | null;
  max_rating: number | null;
  date_range: number | null;
  include_replies: boolean;
  match_all_keywords: boolean;
  filter_keywords: BaseKeyword[];
}
