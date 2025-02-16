"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import ReviewFilterConfigurator from "@/app/components/ReviewFilterConfigurator";
import { DBFilterConfig, ComponentFilterConfig } from "@/types/filters";

export default function EditFiltersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [filterConfig, setFilterConfig] = useState<DBFilterConfig | null>(null);

  useEffect(() => {
    async function loadCurrentFilters() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("filter_configs")
        .select(
          `
          id,
          user_id,
          name,
          match_all_keywords,
          min_rating,
          max_rating,
          date_range,
          include_replies,
          created_at,
          updated_at,
          filter_keywords (
            id,
            term,
            match_exact
          )
        `
        )
        .eq("user_id", session.user.id)
        .single();

      if (error) {
        toast({
          title: "Error loading filters",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setFilterConfig(data as DBFilterConfig);
      }
      setIsLoading(false);
    }

    loadCurrentFilters();
  }, [router, toast]);

  const handleUpdateFilters = async (config: ComponentFilterConfig) => {
    if (!filterConfig) return;

    try {
      const { error: configError } = await supabase
        .from("filter_configs")
        .update({
          match_all_keywords: config.matchAllKeywords,
          min_rating: config.minRating,
          max_rating: config.maxRating,
          date_range: config.dateRange,
          include_replies: config.includeReplies,
          updated_at: new Date().toISOString(),
        })
        .eq("id", filterConfig.id);

      if (configError) throw configError;

      const { error: keywordsError } = await supabase
        .from("filter_keywords")
        .upsert(
          config.keywords.map((k) => ({
            id: k.id,
            filter_config_id: filterConfig.id,
            term: k.term,
            match_exact: k.matchExact,
          }))
        );

      if (keywordsError) throw keywordsError;

      toast({
        title: "Filters updated",
        description: "Your filter settings have been saved",
      });

      router.push("/dashboard/reviews");
    } catch (error) {
      toast({
        title: "Error updating filters",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!filterConfig) {
    return <div>No filter configuration found</div>;
  }

  // Transform database format to component format
  const initialConfig: ComponentFilterConfig = {
    keywords: filterConfig.filter_keywords.map((k) => ({
      id: k.id,
      term: k.term,
      matchExact: k.match_exact,
    })),
    matchAllKeywords: filterConfig.match_all_keywords,
    minRating: filterConfig.min_rating ?? 1,
    maxRating: filterConfig.max_rating ?? 5,
    dateRange: filterConfig.date_range ?? 30,
    includeReplies: filterConfig.include_replies,
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Edit Review Filters</h1>
        <p className="text-muted-foreground mt-1">
          Update your keyword filters for {filterConfig.filter_keywords.length}{" "}
          keywords
        </p>
      </div>

      <ReviewFilterConfigurator
        initialConfig={initialConfig}
        onSave={handleUpdateFilters}
        showAppsList={false}
      />
    </div>
  );
}
