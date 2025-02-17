"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsFilter } from "@/app/components/dashboard/AnalyticsFilter";
import { Star, MessageSquare, Filter, Calendar } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { FilterConfig } from "@/types/analytics.types";

interface AnalyticsData {
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

interface FilterKeyword {
  id: string;
  term: string;
  match_exact: boolean;
}

interface MatchedReviewResponse {
  id: string;
  matched_at: string;
  review: {
    id: string;
    rating: number;
    text: string;
    review_date: string;
    app: {
      name: string;
      icon_url: string;
    };
  };
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<number>(30);
  const [apps, setApps] = useState<{ id: string; name: string }[]>([]);
  const [data, setData] = useState<AnalyticsData>({
    reviewTrend: [],
    ratingDistribution: [],
    keywordMatches: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filterConfig, setFilterConfig] = useState<FilterConfig | null>(null);

  useEffect(() => {
    async function loadApps() {
      console.log("Loading apps...");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth");
        return;
      }

      const { data } = await supabase
        .from("apps")
        .select("id, name")
        .order("name");

      console.log("Apps loaded:", data);

      if (data && data.length > 0) {
        setApps(data);
        // Set the first app as the selected app
        setSelectedApp(data[0].id);
      }
      setIsLoading(false);
    }

    loadApps();
  }, [router]);

  useEffect(() => {
    async function loadAnalytics() {
      console.log("Loading analytics...", { selectedApp, filterConfig });
      if (!selectedApp || !filterConfig) {
        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.push("/auth");
          return;
        }

        // Get review trend data for the selected date range
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - dateRange);

        const [allReviews, matchedReviews] = await Promise.all([
          // Get all reviews for the app
          supabase
            .from("reviews")
            .select("review_date")
            .eq("app_id", selectedApp)
            .gte("review_date", cutoffDate.toISOString())
            .order("review_date", { ascending: true }),

          // Get matched reviews with corrected query
          supabase
            .from("matched_reviews")
            .select(
              `
              id,
              matched_at,
              review:reviews!inner (
                id,
                rating,
                text,
                review_date,
                app:apps!inner (
                  name,
                  icon_url
                )
              )
            `
            )
            .eq("filter_config_id", filterConfig.id)
            .returns<MatchedReviewResponse[]>(),
        ]);

        if (allReviews.error) throw allReviews.error;
        if (matchedReviews.error) throw matchedReviews.error;

        if (allReviews.data && matchedReviews.data) {
          // Group all reviews by date
          const totalReviewsByDate = allReviews.data.reduce<
            Record<string, number>
          >((acc, review) => {
            const date = new Date(review.review_date)
              .toISOString()
              .split("T")[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
          }, {});

          // Group matched reviews by date with corrected access
          const matchedReviewsByDate = matchedReviews.data.reduce<
            Record<string, number>
          >((acc, item) => {
            const date = new Date(item.review.review_date)
              .toISOString()
              .split("T")[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
          }, {});

          // Fill in missing dates with 0
          const trend = [];
          for (
            let d = new Date(cutoffDate);
            d <= new Date();
            d.setDate(d.getDate() + 1)
          ) {
            const date = d.toISOString().split("T")[0];
            trend.push({
              date,
              totalReviews: totalReviewsByDate[date] || 0,
              matchedReviews: matchedReviewsByDate[date] || 0,
            });
          }

          setData({
            reviewTrend: trend,
            ratingDistribution: [],
            keywordMatches: [],
          });
        }

        console.log("Analytics loaded:", { allReviews, matchedReviews });

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading analytics:", error);
        setIsLoading(false);
      }
    }

    loadAnalytics();
  }, [router, selectedApp, dateRange, filterConfig]);

  useEffect(() => {
    async function loadFilterConfig() {
      console.log("Loading filter config for app:", selectedApp);
      if (!selectedApp) {
        setFilterConfig(null);
        return;
      }

      const { data, error } = await supabase
        .from("monitored_apps")
        .select(
          `
          filter_config:filter_configs!inner (
            id,
            min_rating,
            max_rating,
            date_range,
            include_replies,
            match_all_keywords,
            filter_keywords (
              id,
              term,
              match_exact
            )
          )
        `
        )
        .eq("app_id", selectedApp)
        .single();

      console.log("Filter config loaded:", data, "Error:", error);

      if (!error && data?.filter_config) {
        setFilterConfig(data.filter_config as unknown as FilterConfig);
      }
    }

    loadFilterConfig();
  }, [selectedApp]);

  if (isLoading || !selectedApp) return <div>Loading apps...</div>;
  if (!filterConfig) return <div>Loading filter configuration...</div>;

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Track your review matching performance and trends
          </p>
        </div>
        <AnalyticsFilter
          apps={apps}
          selectedApp={selectedApp}
          onAppChange={setSelectedApp}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="bg-accent/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.reviewTrend
                .reduce((acc, item) => acc + item.totalReviews, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              in the last {dateRange} days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-accent/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Matched Reviews
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.reviewTrend
                .reduce((acc, item) => acc + item.matchedReviews, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              in the last {dateRange} days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-accent/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Filters
            </CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {selectedApp && filterConfig && (
                <>
                  {(filterConfig.min_rating || filterConfig.max_rating) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-accent-2/50 text-[#00ff8c] border border-[#00ff8c]/30">
                      <Star className="h-3 w-3 mr-1" />
                      {filterConfig.min_rating === filterConfig.max_rating
                        ? `${filterConfig.min_rating}★`
                        : `${filterConfig.min_rating}-${filterConfig.max_rating}★`}
                    </span>
                  )}
                  {filterConfig.date_range && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-accent-2/50 text-[#00ff8c] border border-[#00ff8c]/30">
                      <Calendar className="h-3 w-3 mr-1" />
                      {filterConfig.date_range} days
                    </span>
                  )}
                  {filterConfig.filter_keywords.map(
                    (keyword: FilterKeyword) => (
                      <span
                        key={keyword.id}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-accent-2/50 text-[#00ff8c] border border-[#00ff8c]/30"
                      >
                        {keyword.term}
                        {keyword.match_exact && " (exact)"}
                      </span>
                    )
                  )}
                </>
              )}
              {(!selectedApp || !filterConfig) && (
                <p className="text-xs text-muted-foreground">
                  No filters applied
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8">
        <Card className="bg-[#121212]/95 backdrop-blur-sm border-accent-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Review Trends</span>
              <span className="text-sm font-normal text-[#00ff8c]">
                Last {dateRange} days
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer>
                <LineChart data={data.reviewTrend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted/30"
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), "MMM d")}
                    className="text-muted-foreground"
                  />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(18, 18, 18, 0.95)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid hsl(var(--accent-2))",
                      borderRadius: "8px",
                      padding: "12px",
                    }}
                    labelFormatter={(date) =>
                      format(new Date(date), "MMMM d, yyyy")
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="totalReviews"
                    stroke="#8884d8"
                    name="Total Reviews"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="matchedReviews"
                    stroke="#00ff8c"
                    name="Matched Reviews"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
