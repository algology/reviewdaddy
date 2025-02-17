"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AnalyticsFilter } from "@/app/components/dashboard/AnalyticsFilter";
import { StatsCard } from "@/app/components/dashboard/StatsCard";
import {
  Star,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { format, subDays } from "date-fns";

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

export default function AnalyticsPage() {
  const router = useRouter();
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [apps, setApps] = useState<{ id: string; name: string }[]>([]);
  const [data, setData] = useState<AnalyticsData>({
    reviewTrend: [],
    ratingDistribution: [],
    keywordMatches: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadApps() {
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

      if (data) {
        setApps(data);
      }
    }

    loadApps();
  }, [router]);

  useEffect(() => {
    async function loadAnalytics() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth");
        return;
      }

      // Get review trend data for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [allReviews, matchedReviews] = await Promise.all([
        // Get all reviews for the app
        supabase
          .from("reviews")
          .select("review_date")
          .eq("app_id", selectedApp)
          .gte("review_date", thirtyDaysAgo.toISOString())
          .order("review_date", { ascending: true }),

        // Get matched reviews
        supabase
          .from("matched_reviews")
          .select(
            `
            id,
            matched_at,
            review:reviews!inner (
              review_date,
              app_id
            )
          `
          )
          .eq("review.app_id", selectedApp)
          .gte("review.review_date", thirtyDaysAgo.toISOString()),
      ]);

      if (allReviews.data && matchedReviews.data) {
        // Group all reviews by date
        const totalReviewsByDate = allReviews.data.reduce(
          (acc: Record<string, number>, review) => {
            const date = new Date(review.review_date)
              .toISOString()
              .split("T")[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
          },
          {}
        );

        // Group matched reviews by date
        const matchedReviewsByDate = matchedReviews.data.reduce(
          (acc: Record<string, number>, item: any) => {
            const date = new Date(item.review.review_date)
              .toISOString()
              .split("T")[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
          },
          {}
        );

        // Fill in missing dates with 0
        const trend = [];
        for (
          let d = new Date(thirtyDaysAgo);
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

      setIsLoading(false);
    }

    loadAnalytics();
  }, [router, selectedApp]);

  if (isLoading) return <div>Loading...</div>;

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
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-[#121212]/95 backdrop-blur-sm border-accent-2">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Matches
                </p>
                <h2 className="text-2xl font-bold mt-2">
                  {data.reviewTrend
                    .reduce((acc, item) => acc + item.totalReviews, 0)
                    .toLocaleString()}
                </h2>
              </div>
              <div className="h-12 w-12 rounded-lg bg-accent-2/50 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-[#00ff8c]" />
              </div>
            </div>
            <div className="mt-4 h-[60px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.reviewTrend.slice(-7)}>
                  <Area
                    type="monotone"
                    dataKey="totalReviews"
                    stroke="#00ff8c"
                    fill="#00ff8c20"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#121212]/95 backdrop-blur-sm border-accent-2">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Rating
                </p>
                <h2 className="text-2xl font-bold mt-2">
                  {data.ratingDistribution.reduce(
                    (acc, item) => acc + item.rating * item.count,
                    0
                  ) /
                    data.ratingDistribution.reduce(
                      (acc, item) => acc + item.count,
                      0
                    ) || 0}
                </h2>
              </div>
              <div className="h-12 w-12 rounded-lg bg-accent-2/50 flex items-center justify-center">
                <Star className="h-6 w-6 text-[#00ff8c]" />
              </div>
            </div>
            <div className="mt-4 h-[60px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.ratingDistribution.slice(-7)}>
                  <Area
                    type="monotone"
                    dataKey="rating"
                    stroke="#00ff8c"
                    fill="#00ff8c20"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#121212]/95 backdrop-blur-sm border-accent-2">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Keyword Matches
                </p>
                <h2 className="text-2xl font-bold mt-2">
                  {data.keywordMatches.reduce(
                    (acc, item) => acc + item.matches,
                    0
                  )}
                </h2>
              </div>
              <div className="h-12 w-12 rounded-lg bg-accent-2/50 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-[#00ff8c]" />
              </div>
            </div>
            <div className="mt-4 h-[60px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.keywordMatches.slice(-7)}>
                  <Area
                    type="monotone"
                    dataKey="matches"
                    stroke="#00ff8c"
                    fill="#00ff8c20"
                  />
                </AreaChart>
              </ResponsiveContainer>
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
                Last 30 days
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
