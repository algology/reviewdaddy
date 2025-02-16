"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  SlidersHorizontal,
  Star,
  ThumbsUp,
  MessageSquare,
  Calendar,
  ArrowUpDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Review {
  id: string;
  appId: string;
  appName: string;
  rating: number;
  text: string;
  date: string;
  userName: string;
  helpful: number;
  sentiment: "positive" | "negative" | "neutral";
  hasDevResponse: boolean;
  keywords: string[];
}

export default function ReviewsPage() {
  const [sortBy, setSortBy] = useState<"date" | "rating" | "helpful">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Review Monitor</h1>
          <p className="text-muted-foreground mt-1">
            Analyzing reviews from 3 apps
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Modify Filters
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#121212]/95 backdrop-blur-sm border-accent-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#00ff8c]/10 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-[#00ff8c]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Matching Reviews
                </p>
                <p className="text-xl font-bold">247</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Add similar cards for Avg Rating, Lead Potential, Critical Issues */}
      </div>

      {/* Search and Filters */}
      <Card className="bg-[#121212]/95 backdrop-blur-sm border-accent-2">
        <CardContent className="p-4 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search within results..."
                className="pl-9 bg-sidebar-accent/40 border-accent-2"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort by: {sortBy}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy("date")}>
                  Date
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("rating")}>
                  Rating
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("helpful")}>
                  Helpful Count
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        <Card className="bg-[#121212]/95 backdrop-blur-sm border-accent-2">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">Game Name</h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-[#00ff8c] text-[#00ff8c]" />
                    <span className="text-sm">4.0</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    • 2 days ago
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Long review text here discussing various issues...
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-[#00ff8c]/10 text-[#00ff8c] border border-[#00ff8c]/20">
                    matchmaking
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-[#00ff8c]/10 text-[#00ff8c] border border-[#00ff8c]/20">
                    server issues
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Mark as Lead
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* More review cards... */}
      </div>
    </div>
  );
}
