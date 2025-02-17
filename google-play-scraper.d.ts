declare module "google-play-scraper" {
  export interface ScrapeOptions {
    appId: string;
    lang?: string;
    country?: string;
    sort?: number;
    num?: number;
    paginate?: boolean;
    nextPaginationToken?: string | null;
    throttle?: number;
  }

  export interface SearchOptions {
    term: string;
    num?: number;
    lang?: string;
    country?: string;
    throttle?: number;
  }

  export interface SearchResult {
    appId: string;
    title: string;
    developer: string;
    icon: string;
    score: number;
    free: boolean;
    currency: string;
    price: number;
  }

  export interface ReviewsResult {
    data: Array<{
      id: string;
      userName: string;
      date: string;
      score: number;
      text: string | null;
      replyDate?: string;
      replyText?: string | null;
      thumbsUp: number;
    }>;
    nextPaginationToken?: string;
  }

  export interface AppDetails {
    title: string;
    description: string;
    icon: string;
    developer: string;
    reviews: number;
    score: number;
    installs: string;
    updated: number;
  }

  export interface GooglePlayScraper {
    reviews(options: ScrapeOptions): Promise<ReviewsResult>;
    app(options: { appId: string }): Promise<AppDetails>;
    search(options: SearchOptions): Promise<SearchResult[]>;
    sort: {
      NEWEST: number;
      RATING: number;
      HELPFULNESS: number;
    };
  }

  const gplay: GooglePlayScraper;
  export = gplay;
}
