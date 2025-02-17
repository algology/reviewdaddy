import { NextResponse } from "next/server";
import gplay from "google-play-scraper";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const appId = searchParams.get("appId");
  const filterConfigId = searchParams.get("filterConfigId");

  if (!appId || !filterConfigId) {
    return NextResponse.json(
      { error: "App ID and filter config ID are required" },
      { status: 400 }
    );
  }

  try {
    // 1. Get filter configuration and app details
    const [filterConfigResult, appResult] = await Promise.all([
      supabase
        .from("filter_configs")
        .select(`*, filter_keywords (*)`)
        .eq("id", filterConfigId)
        .single(),
      supabase.from("apps").select("id").eq("play_store_id", appId).single(),
    ]);

    if (filterConfigResult.error) throw filterConfigResult.error;
    if (appResult.error) throw appResult.error;

    const filterConfig = filterConfigResult.data;
    const app = appResult.data;

    // 2. Fetch reviews from Google Play
    const reviews = await gplay.reviews({
      appId,
      sort: gplay.sort.NEWEST,
      num: 200,
      paginate: true,
      nextPaginationToken: searchParams.get("nextPage") || undefined,
    });

    // 3. Store all reviews first
    const { data: storedReviews, error: reviewsError } = await supabase
      .from("reviews")
      .upsert(
        reviews.data.map((review: any) => ({
          app_id: app.id,
          play_store_review_id: review.id,
          rating: review.score,
          text: review.text,
          reviewer_name: review.userName,
          helpful_count: review.thumbsUp,
          reply_text: review.replyText,
          replied_at: review.replyDate
            ? new Date(review.replyDate).toISOString()
            : null,
          review_date: new Date(review.date).toISOString(),
        })),
        { onConflict: "play_store_review_id" }
      )
      .select();

    if (reviewsError) throw reviewsError;

    // 4. Apply filters and create matches
    const filteredReviews = storedReviews.filter((review) => {
      // Skip reviews without text if we're doing keyword matching
      if (filterConfig.filter_keywords.length > 0 && !review.text) {
        return false;
      }

      // Rating filter
      if (filterConfig.min_rating && review.rating < filterConfig.min_rating)
        return false;
      if (filterConfig.max_rating && review.rating > filterConfig.max_rating)
        return false;

      // Date filter
      if (filterConfig.date_range) {
        const reviewDate = new Date(review.review_date);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - filterConfig.date_range);
        if (reviewDate < cutoffDate) return false;
      }

      // Keyword filters
      if (filterConfig.filter_keywords.length > 0) {
        const reviewText = review.text.toLowerCase();
        const keywordMatches = filterConfig.filter_keywords.map(
          (keyword: any) => {
            const term = keyword.term.toLowerCase();
            return keyword.match_exact
              ? reviewText.includes(` ${term} `)
              : reviewText.includes(term);
          }
        );

        if (filterConfig.match_all_keywords) {
          if (!keywordMatches.every((match: any) => match)) return false;
        } else {
          if (!keywordMatches.some((match: any) => match)) return false;
        }
      }

      return true;
    });

    // 5. Store matches
    if (filteredReviews.length > 0) {
      const { error: matchError } = await supabase
        .from("matched_reviews")
        .upsert(
          filteredReviews.map((review) => ({
            review_id: review.id,
            filter_config_id: filterConfigId,
            matched_at: new Date().toISOString(),
          })),
          {
            onConflict: "review_id,filter_config_id",
            ignoreDuplicates: true,
          }
        );

      if (matchError) throw matchError;
    }

    // 6. Update app's last_synced_at
    await supabase
      .from("apps")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", app.id);

    return NextResponse.json({
      reviews: filteredReviews,
      nextPage: reviews.nextPaginationToken,
    });
  } catch (error) {
    console.error("Review scraping error details:", {
      error,
      appId,
      filterConfigId,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch reviews",
      },
      { status: 500 }
    );
  }
}
