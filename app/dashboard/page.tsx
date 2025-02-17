"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { StatsCard } from "@/app/components/dashboard/StatsCard";
import { Smartphone, MessageSquare, Filter, Star } from "lucide-react";
import { MonitoredApp } from "@/types/playstore.types";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalApps: 0,
    totalMatches: 0,
    averageRating: 0,
    totalReviews: 0,
    activeFilters: 0,
  });
  const [recentApps, setRecentApps] = useState<MonitoredApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth");
        return;
      }

      const { data: monitoredApps, error } = await supabase
        .from("monitored_apps")
        .select(
          `
          app:apps!app_id (
            id,
            play_store_id,
            name,
            developer,
            icon_url,
            current_rating,
            total_reviews,
            created_at,
            last_synced_at
          ),
          filter_config:filter_configs!filter_config_id (
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
        .eq("filter_configs.user_id", session.user.id)
        .returns<
          {
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
              filter_keywords: Array<{
                id: string;
                term: string;
                match_exact: boolean;
              }>;
            };
          }[]
        >();

      if (!error && monitoredApps) {
        setStats({
          totalApps: monitoredApps.length,
          totalMatches: 0,
          averageRating: 0,
          totalReviews: 0,
          activeFilters: 0,
        });

        setRecentApps(monitoredApps);
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [router]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Monitored Apps"
          value={stats.totalApps}
          icon={<Smartphone className="h-4 w-4" />}
          className="bg-accent/50"
        />
        <StatsCard
          title="Matched Reviews"
          value={stats.totalMatches}
          icon={<MessageSquare className="h-4 w-4" />}
          className="bg-accent/50"
        />
        <StatsCard
          title="Active Filters"
          value={stats.activeFilters}
          icon={<Filter className="h-4 w-4" />}
          className="bg-accent/50"
        />
        <StatsCard
          title="Average Rating"
          value={stats.averageRating.toFixed(1)}
          description={`Across ${stats.totalReviews.toLocaleString()} reviews`}
          icon={<Star className="h-4 w-4" />}
          className="bg-accent/50"
        />
      </div>

      <div className="rounded-lg border bg-accent/50">
        <div className="p-4">
          <h2 className="text-xl font-semibold">Recently Monitored Apps</h2>
        </div>
        <div className="divide-y divide-accent">
          {recentApps.map((app) => (
            <div key={app.app.id} className="flex items-center p-4">
              <div className="w-10 h-10 rounded-lg bg-accent-2/50 overflow-hidden relative">
                <img
                  src={app.app.icon_url}
                  alt={app.app.name}
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
              <div className="ml-4 flex-1">
                <h3 className="font-medium">{app.app.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Last synced:{" "}
                  {app.app.last_synced_at
                    ? new Date(app.app.last_synced_at).toLocaleString()
                    : "Never"}
                </p>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {app.app.current_rating.toFixed(1)} ★
                </div>
                <div className="text-sm text-muted-foreground">
                  {app.app.total_reviews.toLocaleString()} reviews
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
