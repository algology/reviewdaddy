"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  X,
  Star,
  Calendar,
  MessageSquare,
  Tag,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ComponentFilterConfig, ComponentKeywordFilter } from "@/types/filters";
import { useKeywordFilters } from "@/hooks/use-keyword-filters";

interface PlayStoreApp {
  id: string;
  name: string;
  icon: string;
  developer: string;
  rating: number;
  reviews: number;
}

interface ReviewFilterConfiguratorProps {
  selectedApps?: PlayStoreApp[];
  initialConfig?: ComponentFilterConfig;
  onSave: (config: ComponentFilterConfig) => Promise<void>;
  showAppsList?: boolean;
}

export default function ReviewFilterConfigurator({
  selectedApps = [],
  initialConfig,
  onSave,
  showAppsList = true,
}: ReviewFilterConfiguratorProps) {
  const {
    keywords: keywordFilters,
    addKeyword,
    removeKeyword,
    updateKeyword,
  } = useKeywordFilters(initialConfig?.keywords ?? []);

  const [filterConfig, setFilterConfig] = useState<ComponentFilterConfig>({
    keywords: initialConfig?.keywords ?? [],
    matchAllKeywords: initialConfig?.matchAllKeywords ?? false,
    minRating: initialConfig?.minRating ?? 1,
    maxRating: initialConfig?.maxRating ?? 5,
    dateRange: initialConfig?.dateRange ?? 30,
    includeReplies: initialConfig?.includeReplies ?? true,
  });

  const [selectedRatings, setSelectedRatings] = useState<number[]>(() => {
    if (!initialConfig) return [];

    if (initialConfig.minRating === initialConfig.maxRating) {
      return [initialConfig.minRating];
    }

    return Array.from(
      { length: initialConfig.maxRating - initialConfig.minRating + 1 },
      (_, i) => i + initialConfig.minRating
    );
  });

  const handleKeywordInput = (value: string) => {
    const isExactMatch = value.startsWith('"') && value.endsWith('"');
    const term = isExactMatch ? value.slice(1, -1) : value;
    return addKeyword(term, isExactMatch);
  };

  const handleQuickSuggestion = (suggestion: string) => {
    const isExactMatch = suggestion.startsWith('"') && suggestion.endsWith('"');
    const term = isExactMatch ? suggestion.slice(1, -1) : suggestion;
    addKeyword(term, isExactMatch);
  };

  const handleSaveFilters = async () => {
    if (keywordFilters.length === 0) {
      throw new Error("Please add at least one keyword to filter reviews");
    }

    const configToSave = {
      ...filterConfig,
      keywords: keywordFilters,
    };

    await onSave(configToSave);
  };

  return (
    <div className="space-y-8">
      {showAppsList && selectedApps.length > 0 && (
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
      )}

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
            {keywordFilters
              .filter((filter) => filter.term)
              .map((filter) => (
                <Button
                  key={filter.id}
                  variant="outline"
                  size="sm"
                  onClick={(e) => e.preventDefault()}
                  className={`text-xs gap-2 h-7 text-[#00ff8c] border-[#00ff8c]/30 hover:bg-[#00ff8c]/10 ${
                    filter.matchExact ? "bg-[#00ff8c]/10" : ""
                  }`}
                >
                  {filter.matchExact ? `"${filter.term}"` : filter.term}
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (filter.id) {
                        removeKeyword(filter.id);
                      }
                    }}
                    className="cursor-pointer hover:text-[#00ff8c] p-1"
                  >
                    <X className="h-3 w-3" />
                  </div>
                </Button>
              ))}
          </div>

          {/* Input Area */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder='Type keyword and press Enter (use quotes for exact match, e.g. "bug fix")'
              className="pl-9 bg-sidebar-accent/40 border-accent-2"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value) {
                  const added = handleKeywordInput(e.currentTarget.value);
                  if (added) {
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
                onClick={() => handleQuickSuggestion(suggestion)}
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
          {/* Rating Filter */}
          <div>
            <Label className="mb-2 block">Rating Filter</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant="outline"
                  size="sm"
                  className={`gap-1 ${
                    selectedRatings.includes(rating)
                      ? "border-[#00ff8c] bg-[#00ff8c]/10 text-[#00ff8c]"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedRatings((prev) => {
                      const newRatings = prev.includes(rating)
                        ? prev.filter((r) => r !== rating)
                        : [...prev, rating].sort((a, b) => a - b);

                      setFilterConfig((prevConfig) => ({
                        ...prevConfig,
                        minRating:
                          newRatings.length > 0 ? Math.min(...newRatings) : 1,
                        maxRating:
                          newRatings.length > 0 ? Math.max(...newRatings) : 5,
                      }));

                      return newRatings;
                    });
                  }}
                >
                  {rating}{" "}
                  <Star
                    className={`h-3 w-3 ${
                      selectedRatings.includes(rating) ? "fill-[#00ff8c]" : ""
                    }`}
                  />
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {selectedRatings.length === 0
                ? "Show all ratings"
                : `Show reviews with ${
                    selectedRatings.length === 1 ? "rating" : "ratings"
                  }: ${selectedRatings.join(", ")}`}
            </p>
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
