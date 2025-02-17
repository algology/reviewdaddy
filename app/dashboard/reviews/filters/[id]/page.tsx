"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import ReviewFilterConfigurator from "@/app/components/ReviewFilterConfigurator";
import { DBFilterConfig, ComponentFilterConfig } from "@/types/filters";

export default function EditFilterPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [filterConfig, setFilterConfig] = useState<DBFilterConfig | null>(null);

  useEffect(() => {
    async function loadFilter() {
      const { data, error } = await supabase
        .from("filter_configs")
        .select(
          `
          *,
          filter_keywords (*)
        `
        )
        .eq("id", params.id)
        .single();

      if (error) {
        toast({
          title: "Error loading filter",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setFilterConfig(data as DBFilterConfig);
    }

    loadFilter();
  }, [params.id, toast]);

  if (!filterConfig) return <div>Loading...</div>;

  const handleSave = async (config: ComponentFilterConfig) => {
    try {
      // 1. Update filter config
      await supabase
        .from("filter_configs")
        .update({
          match_all_keywords: config.matchAllKeywords,
          min_rating: config.minRating,
          max_rating: config.maxRating,
          date_range: config.dateRange,
          include_replies: config.includeReplies,
        })
        .eq("id", filterConfig.id);

      // 2. Delete all existing keywords
      await supabase
        .from("filter_keywords")
        .delete()
        .eq("filter_config_id", filterConfig.id);

      // 3. Insert new keywords
      if (config.keywords.length > 0) {
        await supabase.from("filter_keywords").insert(
          config.keywords.map((k) => ({
            filter_config_id: filterConfig.id,
            term: k.term,
            match_exact: k.matchExact,
          }))
        );
      }

      toast({
        title: "Filter updated",
        description: "Your changes have been saved",
      });

      router.push("/dashboard/reviews");
    } catch (error) {
      toast({
        title: "Error updating filter",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Edit Filter</h1>
      <ReviewFilterConfigurator
        initialConfig={{
          keywords: filterConfig.filter_keywords.map((k) => ({
            term: k.term,
            matchExact: k.match_exact,
          })),
          matchAllKeywords: filterConfig.match_all_keywords,
          minRating: filterConfig.min_rating ?? 1,
          maxRating: filterConfig.max_rating ?? 5,
          dateRange: filterConfig.date_range ?? 30,
          includeReplies: filterConfig.include_replies,
        }}
        onSave={handleSave}
        showAppsList={false}
      />
    </div>
  );
}
