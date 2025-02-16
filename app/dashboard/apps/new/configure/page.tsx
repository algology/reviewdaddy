"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  X,
  ArrowRight,
  Star,
  Calendar,
  MessageSquare,
  Tag,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

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
  const [keywordFilters, setKeywordFilters] = useState<KeywordFilter[]>([
    { id: "1", term: "", matchExact: false },
  ]);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    keywords: [],
    matchAllKeywords: false,
    minRating: 1,
    maxRating: 5,
    dateRange: 30,
    includeReplies: true,
  });

  useEffect(() => {
    // Retrieve selected apps from session storage
    const apps = sessionStorage.getItem("selectedApps");
    if (!apps) {
      router.push("/dashboard/apps/new");
      return;
    }
    setSelectedApps(JSON.parse(apps));
  }, [router]);

  const handleAddKeywordFilter = () => {
    setKeywordFilters((prev) => [
      ...prev,
      { id: Math.random().toString(), term: "", matchExact: false },
    ]);
  };

  const handleRemoveKeywordFilter = (id: string) => {
    if (keywordFilters.length === 1) return;
    setKeywordFilters((prev) => prev.filter((filter) => filter.id !== id));
  };

  const handleKeywordChange = (id: string, value: string) => {
    setKeywordFilters((prev) =>
      prev.map((filter) =>
        filter.id === id ? { ...filter, term: value } : filter
      )
    );
  };

  const toggleExactMatch = (id: string) => {
    setKeywordFilters((prev) =>
      prev.map((filter) =>
        filter.id === id
          ? { ...filter, matchExact: !filter.matchExact }
          : filter
      )
    );
  };

  const handleSaveFilters = async () => {
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

      if (keywordFilters.filter((f) => f.term.trim()).length === 0) {
        toast({
          title: "No keywords specified",
          description: "Please add at least one keyword to filter reviews",
          variant: "destructive",
        });
        return;
      }

      const validKeywords = keywordFilters
        .filter((filter) => filter.term.trim())
        .map((filter) => ({
          term: filter.term.trim(),
          matchExact: filter.matchExact,
        }));

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

      if (appsError) {
        toast({
          title: "Error saving apps",
          description: appsError.message,
          variant: "destructive",
        });
        return;
      }

      if (!insertedApps) {
        toast({
          title: "Error saving apps",
          description: "No apps were inserted",
          variant: "destructive",
        });
        return;
      }

      // 2. Create the filter configuration
      const { data: newFilterConfig, error: filterError } = await supabase
        .from("filter_configs")
        .insert({
          user_id: session.user.id,
          name: `Filter for ${selectedApps.length} apps`,
          match_all_keywords: filterConfig.matchAllKeywords,
          min_rating: filterConfig.minRating,
          max_rating: filterConfig.maxRating,
          date_range: filterConfig.dateRange,
          include_replies: filterConfig.includeReplies,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (filterError) {
        toast({
          title: "Error saving filter configuration",
          description: filterError.message,
          variant: "destructive",
        });
        return;
      }

      if (!newFilterConfig) {
        toast({
          title: "Error saving filter configuration",
          description: "No filter configuration was created",
          variant: "destructive",
        });
        return;
      }

      // 3. Add the keywords
      const { error: keywordsError } = await supabase
        .from("filter_keywords")
        .insert(
          validKeywords.map((keyword) => ({
            filter_config_id: newFilterConfig.id,
            term: keyword.term,
            match_exact: keyword.matchExact,
          }))
        );

      if (keywordsError) {
        toast({
          title: "Error saving keywords",
          description: keywordsError.message,
          variant: "destructive",
        });
        return;
      }

      // 4. Add the apps to be monitored
      const { error: monitoredAppsError } = await supabase
        .from("monitored_apps")
        .insert(
          insertedApps.map((app) => ({
            app_id: app.id,
            filter_config_id: newFilterConfig.id,
          }))
        );

      if (monitoredAppsError) {
        toast({
          title: "Error linking apps to filter",
          description: monitoredAppsError.message,
          variant: "destructive",
        });
        return;
      }

      // Success! Store the filter_config_id and redirect
      sessionStorage.setItem("current_filter_id", newFilterConfig.id);

      toast({
        title: "Filter configuration saved",
        description: "Redirecting to review monitor...",
      });

      router.push("/dashboard/reviews");
    } catch (error) {
      toast({
        title: "Unexpected error",
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

      {/* Selected Apps Summary */}
      <Card className="bg-[#121212]/95 backdrop-blur-sm border-accent-2">
        <CardHeader>
          <h3 className="text-lg font-medium">Selected Apps</h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {selectedApps.map((app) => (
              <div
                key={app.id}
                className="flex items-center gap-2 p-2 rounded-lg border border-accent-2 bg-accent-1/50"
              >
                <div className="w-8 h-8 rounded-lg bg-accent-2/50 overflow-hidden relative">
                  <img
                    src={app.icon}
                    alt={app.name}
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
                <span className="font-medium">{app.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Keyword Filters */}
      <Card className="bg-[#121212]/95 backdrop-blur-sm border-accent-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-[#00ff8c]" />
              <h3 className="text-lg font-medium">Keyword Filters</h3>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-sm ${
                  !filterConfig.matchAllKeywords
                    ? "text-[#00ff8c]"
                    : "text-muted-foreground"
                }`}
              >
                Match Any
              </span>
              <Switch
                checked={filterConfig.matchAllKeywords}
                onCheckedChange={(checked) =>
                  setFilterConfig((prev) => ({
                    ...prev,
                    matchAllKeywords: checked,
                  }))
                }
                className="data-[state=checked]:bg-[#00ff8c]"
              />
              <span
                className={`text-sm ${
                  filterConfig.matchAllKeywords
                    ? "text-[#00ff8c]"
                    : "text-muted-foreground"
                }`}
              >
                Match All
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Add keywords or phrases to search for in reviews. Use quotes for
            exact matches.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Active Filters Display */}
          <div className="flex flex-wrap gap-2">
            {keywordFilters.map(
              (filter) =>
                filter.term && (
                  <Button
                    key={filter.id}
                    variant="outline"
                    size="sm"
                    className={`text-xs gap-2 h-7 text-[#00ff8c] border-[#00ff8c]/30 hover:bg-[#00ff8c]/10 ${
                      filter.matchExact ? "bg-[#00ff8c]/10" : ""
                    }`}
                  >
                    {filter.matchExact ? `"${filter.term}"` : filter.term}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveKeywordFilter(filter.id);
                      }}
                      className="cursor-pointer hover:text-[#00ff8c] p-1"
                    >
                      <X className="h-3 w-3" />
                    </div>
                  </Button>
                )
            )}
          </div>

          {/* Input Area */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder='Type keyword and press Enter (use quotes for exact match, e.g. "bug fix")'
              className="pl-9 bg-sidebar-accent/40 border-accent-2"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value) {
                  const value = e.currentTarget.value;
                  const isExactMatch =
                    value.startsWith('"') && value.endsWith('"');
                  const term = isExactMatch ? value.slice(1, -1) : value;

                  if (term) {
                    setKeywordFilters((prev) => [
                      ...prev,
                      {
                        id: Math.random().toString(),
                        term: term,
                        matchExact: isExactMatch,
                      },
                    ]);
                    e.currentTarget.value = "";
                  }
                }
              }}
            />
          </div>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Quick add:</span>
            {[
              "bug",
              "crash",
              "feature request",
              '"not working"',
              '"can\'t login"',
            ].map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => {
                  const isExactMatch =
                    suggestion.startsWith('"') && suggestion.endsWith('"');
                  const term = isExactMatch
                    ? suggestion.slice(1, -1)
                    : suggestion;

                  setKeywordFilters((prev) => [
                    ...prev,
                    {
                      id: Math.random().toString(),
                      term: term,
                      matchExact: isExactMatch,
                    },
                  ]);
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                {suggestion}
              </Button>
            ))}
          </div>

          {/* Helper Text */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Use quotes for exact phrase matching (e.g., "can't login")</p>
            <p>• Keywords are case-insensitive</p>
            <p>
              •{" "}
              {filterConfig.matchAllKeywords
                ? "Reviews must match ALL keywords (AND)"
                : "Reviews can match ANY keyword (OR)"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Additional Filters */}
      <Card className="bg-[#121212]/95 backdrop-blur-sm border-accent-2">
        <CardHeader>
          <h3 className="text-lg font-medium">Additional Filters</h3>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rating Range */}
          <div>
            <Label className="mb-2 block">Rating Range</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">Min Rating:</Label>
                <div className="flex items-center gap-1 p-2 rounded-md bg-sidebar-accent/40 border border-accent-2">
                  <select
                    className="bg-transparent outline-none"
                    value={filterConfig.minRating}
                    onChange={(e) =>
                      setFilterConfig((prev) => ({
                        ...prev,
                        minRating: Number(e.target.value),
                        maxRating: Math.max(
                          Number(e.target.value),
                          prev.maxRating
                        ),
                      }))
                    }
                  >
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating}
                      </option>
                    ))}
                  </select>
                  <Star className="h-4 w-4 text-[#00ff8c] fill-[#00ff8c]" />
                </div>
              </div>
              <span className="text-muted-foreground">to</span>
              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">Max Rating:</Label>
                <div className="flex items-center gap-1 p-2 rounded-md bg-sidebar-accent/40 border border-accent-2">
                  <select
                    className="bg-transparent outline-none"
                    value={filterConfig.maxRating}
                    onChange={(e) =>
                      setFilterConfig((prev) => ({
                        ...prev,
                        maxRating: Number(e.target.value),
                        minRating: Math.min(
                          Number(e.target.value),
                          prev.minRating
                        ),
                      }))
                    }
                  >
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating}
                      </option>
                    ))}
                  </select>
                  <Star className="h-4 w-4 text-[#00ff8c] fill-[#00ff8c]" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant="outline"
                  size="sm"
                  className={`gap-1 ${
                    rating >= filterConfig.minRating &&
                    rating <= filterConfig.maxRating
                      ? "border-[#00ff8c] bg-[#00ff8c]/10"
                      : ""
                  }`}
                  onClick={() => {
                    if (
                      rating === filterConfig.minRating &&
                      rating === filterConfig.maxRating
                    ) {
                      // Reset to full range if clicking the only selected rating
                      setFilterConfig((prev) => ({
                        ...prev,
                        minRating: 1,
                        maxRating: 5,
                      }));
                    } else {
                      // Set both min and max to the clicked rating
                      setFilterConfig((prev) => ({
                        ...prev,
                        minRating: rating,
                        maxRating: rating,
                      }));
                    }
                  }}
                >
                  {rating}{" "}
                  <Star
                    className={`h-3 w-3 ${
                      rating >= filterConfig.minRating &&
                      rating <= filterConfig.maxRating
                        ? "fill-[#00ff8c]"
                        : ""
                    }`}
                  />
                </Button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <Label className="mb-2 block">Review Date Range</Label>
            <div className="flex items-center gap-4">
              <Calendar className="h-4 w-4 text-[#00ff8c]" />
              <div className="relative w-[200px]">
                <select
                  className="w-full appearance-none bg-sidebar-accent/40 border border-accent-2 rounded-md p-2 pr-8"
                  value={filterConfig.dateRange}
                  onChange={(e) =>
                    setFilterConfig((prev) => ({
                      ...prev,
                      dateRange: Number(e.target.value),
                    }))
                  }
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 3 months</option>
                  <option value={180}>Last 6 months</option>
                  <option value={365}>Last year</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>

          {/* Include Developer Replies */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={filterConfig.includeReplies}
                onCheckedChange={(checked) =>
                  setFilterConfig((prev) => ({
                    ...prev,
                    includeReplies: checked,
                  }))
                }
              />
              <Label>Include Developer Replies</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSaveFilters}
          className="bg-[#00ff8c] text-black hover:bg-[#00cf8a]"
        >
          Start Monitoring
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
