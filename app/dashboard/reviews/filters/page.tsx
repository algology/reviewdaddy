"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/types/database.types";

type App = Database["public"]["Tables"]["apps"]["Row"];
type FilterConfig = Database["public"]["Tables"]["filter_configs"]["Row"] & {
  filter_keywords: Database["public"]["Tables"]["filter_keywords"]["Row"][];
};

interface MonitoredApp {
  app: App;
  filter_config: FilterConfig;
}

export default function EditFiltersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [filterConfig, setFilterConfig] = useState<FilterConfig | null>(null);

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
        setFilterConfig(data as FilterConfig);
      }
      setIsLoading(false);
    }

    loadCurrentFilters();
  }, [router, toast]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!filterConfig) {
    return <div>No filter configuration found</div>;
  }

  const handleUpdateFilters = async () => {
    if (!filterConfig) return;

    try {
      const { error: configError } = await supabase
        .from("filter_configs")
        .update({
          match_all_keywords: filterConfig.match_all_keywords,
          min_rating: filterConfig.min_rating,
          max_rating: filterConfig.max_rating,
          date_range: filterConfig.date_range,
          include_replies: filterConfig.include_replies,
          updated_at: new Date().toISOString(),
        })
        .eq("id", filterConfig.id);

      if (configError) throw configError;

      // Update keywords
      const { error: keywordsError } = await supabase
        .from("filter_keywords")
        .upsert(
          filterConfig.filter_keywords.map((k) => ({
            id: k.id,
            filter_config_id: filterConfig.id,
            term: k.term,
            match_exact: k.match_exact,
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

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Edit Review Filters</h1>
        <p className="text-muted-foreground mt-1">
          Update your keyword filters for {filterConfig.filter_keywords.length}{" "}
          keywords
        </p>
      </div>

      {/* Keyword Filters */}
      <Card className="bg-[#121212]/95 backdrop-blur-sm border-accent-2">
        <CardHeader>
          <h3 className="text-lg font-medium">Keyword Filters</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {filterConfig.filter_keywords.map((filter, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Enter keyword or phrase"
                  value={filter.term}
                  onChange={(e) => {
                    const newFilters = [...filterConfig.filter_keywords];
                    newFilters[index].term = e.target.value;
                    setFilterConfig({
                      ...filterConfig,
                      filter_keywords: newFilters,
                    });
                  }}
                />
                <div className="flex items-center gap-2">
                  <Switch
                    id={`exact-match-${index}`}
                    checked={filter.match_exact}
                    onCheckedChange={(checked) => {
                      const newFilters = [...filterConfig.filter_keywords];
                      newFilters[index].match_exact = checked;
                      setFilterConfig({
                        ...filterConfig,
                        filter_keywords: newFilters,
                      });
                    }}
                  />
                  <Label htmlFor={`exact-match-${index}`}>Exact match</Label>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => {
                  setFilterConfig({
                    ...filterConfig,
                    filter_keywords: filterConfig.filter_keywords.filter(
                      (_, i) => i !== index
                    ),
                  });
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setFilterConfig({
                ...filterConfig,
                filter_keywords: [
                  ...filterConfig.filter_keywords,
                  { id: "", term: "", match_exact: false },
                ],
              });
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Keyword
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/reviews")}
        >
          Cancel
        </Button>
        <Button onClick={handleUpdateFilters}>Save Changes</Button>
      </div>
    </div>
  );
}
