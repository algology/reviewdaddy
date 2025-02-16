"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import ReviewFilterConfigurator from "@/app/components/ReviewFilterConfigurator";
import { ComponentFilterConfig } from "@/types/filters";

interface PlayStoreApp {
  id: string;
  name: string;
  icon: string;
  developer: string;
  rating: number;
  reviews: number;
}

interface KeywordFilter {
  id: string;
  term: string;
  matchExact: boolean;
}

interface FilterConfig {
  keywords: KeywordFilter[];
  matchAllKeywords: boolean;
  minRating: number;
  maxRating: number;
  dateRange: number; // days
  includeReplies: boolean;
}

export default function ConfigureFiltersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedApps, setSelectedApps] = useState<PlayStoreApp[]>([]);

  useEffect(() => {
    // Retrieve selected apps from session storage
    const apps = sessionStorage.getItem("selectedApps");
    if (!apps) {
      router.push("/dashboard/apps/new");
      return;
    }
    setSelectedApps(JSON.parse(apps));
  }, [router]);

  const handleSaveFilters = async (config: ComponentFilterConfig) => {
    try {
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession();

      if (authError || !session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save filters",
          variant: "destructive",
        });
        router.push("/auth");
        return;
      }

      // 1. Insert apps first
      const { data: insertedApps, error: appsError } = await supabase
        .from("apps")
        .upsert(
          selectedApps.map((app) => ({
            play_store_id: app.id,
            name: app.name,
            developer: app.developer,
            icon_url: app.icon,
            current_rating: app.rating,
            total_reviews: app.reviews,
          })),
          { onConflict: "play_store_id" }
        )
        .select();

      if (appsError || !insertedApps) {
        throw appsError || new Error("No apps were inserted");
      }

      // 2. Create the filter configuration
      const { data: newFilterConfig, error: filterError } = await supabase
        .from("filter_configs")
        .insert({
          user_id: session.user.id,
          name: `Filter for ${selectedApps.length} apps`,
          match_all_keywords: config.matchAllKeywords,
          min_rating: config.minRating,
          max_rating: config.maxRating,
          date_range: config.dateRange,
          include_replies: config.includeReplies,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (filterError || !newFilterConfig) {
        throw filterError || new Error("No filter configuration was created");
      }

      // 3. Add the keywords
      const { error: keywordsError } = await supabase
        .from("filter_keywords")
        .insert(
          config.keywords.map((keyword) => ({
            filter_config_id: newFilterConfig.id,
            term: keyword.term,
            match_exact: keyword.matchExact,
          }))
        );

      if (keywordsError) throw keywordsError;

      // 4. Add the apps to be monitored
      const { error: monitoredAppsError } = await supabase
        .from("monitored_apps")
        .insert(
          insertedApps.map((app) => ({
            app_id: app.id,
            filter_config_id: newFilterConfig.id,
          }))
        );

      if (monitoredAppsError) throw monitoredAppsError;

      // Success! Store the filter_config_id and redirect
      sessionStorage.setItem("current_filter_id", newFilterConfig.id);

      toast({
        title: "Filter configuration saved",
        description: "Redirecting to review monitor...",
      });

      router.push("/dashboard/reviews");
    } catch (error) {
      toast({
        title: "Error saving configuration",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Configure Review Filters</h1>
        <p className="text-muted-foreground mt-1">
          Set up filters to find relevant reviews
        </p>
      </div>

      <ReviewFilterConfigurator
        selectedApps={selectedApps}
        onSave={handleSaveFilters}
        showAppsList={true}
      />
    </div>
  );
}
