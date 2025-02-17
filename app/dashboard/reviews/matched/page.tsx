"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, MessageSquare, Tag, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MatchedReview {
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
    filter_keywords: {
      term: string;
      match_exact: boolean;
    }[];
  };
  matched_at: string;
}

export default function MatchedReviewsPage() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<MatchedReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  const loadMatchedReviews = async () => {
    const { data, error } = await supabase
      .from("matched_reviews")
      .select(
        `
        id,
        matched_at,
        review:reviews!inner (
          id,
          rating,
          text,
          reply_text,
          reviewer_name,
          review_date,
          app:apps!inner (
            name,
            icon_url
          )
        ),
        filter_config:filter_configs!inner (
          name,
          filter_keywords (
            term,
            match_exact
          )
        )
      `
      )
      .order("matched_at", { ascending: false });

    if (!error && data) {
      const formattedReviews: MatchedReview[] = data.map((item: any) => ({
        id: item.id,
        matched_at: item.matched_at,
        review: {
          id: item.review.id,
          rating: item.review.rating,
          text: item.review.text,
          reply_text: item.review.reply_text,
          reviewer_name: item.review.reviewer_name,
          review_date: item.review.review_date,
          app: {
            name: item.review.app.name,
            icon_url: item.review.app.icon_url,
          },
        },
        filter_config: {
          name: item.filter_config.name,
          filter_keywords: item.filter_config.filter_keywords || [],
        },
      }));
      setReviews(formattedReviews);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadMatchedReviews();
  }, []);

  const syncReviews = async () => {
    setIsSyncing(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth");
        return;
      }

      // Get all monitored apps
      const { data: monitoredApps, error: appsError } = await supabase
        .from("monitored_apps")
        .select(
          `
          app:apps!inner (
            play_store_id
          ),
          filter_config:filter_configs!inner (
            id,
            user_id
          ),
          filter_config_id
        `
        )
        .eq("filter_config.user_id", session.user.id)
        .returns<
          {
            app: { play_store_id: string };
            filter_config: { id: string; user_id: string };
            filter_config_id: string;
          }[]
        >();

      if (appsError) {
        throw new Error("Failed to fetch monitored apps");
      }

      if (!monitoredApps || monitoredApps.length === 0) {
        toast({
          title: "No apps found",
          description: "Add some apps to start monitoring reviews",
          variant: "destructive",
        });
        return;
      }

      // Sync reviews for each app
      await Promise.all(
        monitoredApps.map(async (ma) => {
          try {
            const response = await fetch(
              `/api/playstore/reviews?appId=${ma.app.play_store_id}&filterConfigId=${ma.filter_config_id}`
            );

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(
                `Failed to sync reviews for app: ${ma.app.play_store_id}. ${
                  errorData.message || response.statusText
                }`
              );
            }
          } catch (error) {
            console.error(`Error syncing app ${ma.app.play_store_id}:`, error);
            throw error;
          }
        })
      );

      // Reload matched reviews
      await loadMatchedReviews();

      toast({
        title: "Reviews synced",
        description: "Latest reviews have been fetched and filtered",
      });
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        title: "Sync failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to sync reviews. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Matched Reviews</h1>
        <Button onClick={syncReviews} disabled={isSyncing}>
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isSyncing ? "animate-spin" : ""}`}
          />
          {isSyncing ? "Syncing..." : "Sync Reviews"}
        </Button>
      </div>

      <div className="space-y-4">
        {reviews.map((matchedReview) => (
          <Card
            key={matchedReview.id}
            className="bg-[#121212]/95 backdrop-blur-sm border-accent-2"
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent-2/50 overflow-hidden relative">
                  <img
                    src={matchedReview.review.app.icon_url}
                    alt={matchedReview.review.app.name}
                    className="w-full h-full object-cover relative z-10"
                    loading="lazy"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "/placeholder-app-icon.png";
                      target.classList.add("opacity-50");
                    }}
                  />
                  <div className="absolute inset-0 bg-accent-2/30 z-0" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">
                      {matchedReview.review.app.name}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      Reviewed on{" "}
                      {new Date(
                        matchedReview.review.review_date
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {Array.from({ length: matchedReview.review.rating }).map(
                        (_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-yellow-500 text-yellow-500"
                          />
                        )
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      by {matchedReview.review.reviewer_name}
                    </span>
                  </div>

                  <p className="text-sm mb-4">{matchedReview.review.text}</p>

                  {matchedReview.review.reply_text && (
                    <div className="bg-accent/20 p-4 rounded-md mt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Developer Response
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {matchedReview.review.reply_text}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mt-4">
                    {matchedReview.filter_config.filter_keywords.map(
                      (keyword, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-accent/20"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {keyword.match_exact
                            ? `"${keyword.term}"`
                            : keyword.term}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
