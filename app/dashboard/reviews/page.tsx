"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Star,
  ChevronDown,
  ExternalLink,
  Pencil,
  Calendar,
  Tag,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";
import { useToast } from "@/hooks/use-toast";

type App = Database["public"]["Tables"]["apps"]["Row"];

interface FilterConfig {
  id: string;
  min_rating: number;
  max_rating: number;
  date_range: number;
  include_replies: boolean;
  match_all_keywords: boolean;
  filter_keywords?: string[];
}

interface MonitoredApp {
  app: App;
  filter_config: FilterConfig;
}

export default function ReviewsPage() {
  const router = useRouter();
  const [monitoredApps, setMonitoredApps] = useState<MonitoredApp[]>([]);
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

      const { data, error } = await supabase
        .from("monitored_apps")
        .select(
          `
          app:apps!inner (
            id,
            name,
            developer,
            icon_url,
            current_rating,
            total_reviews,
            last_synced_at
          ),
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
        .eq("filter_configs.user_id", session.user.id);

      if (!error && data) {
        setMonitoredApps(data as MonitoredApp[]);
      }
      setIsLoading(false);
    }

    loadApps();
  }, [router]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Review Monitor</h1>
          <p className="text-muted-foreground mt-1">
            Monitoring {monitoredApps.length} app
            {monitoredApps.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>App</TableHead>
            <TableHead>Developer</TableHead>
            <TableHead className="text-right">Rating</TableHead>
            <TableHead className="text-right">Reviews</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Active Filters</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {monitoredApps.map((app) => (
            <TableRow key={app.app.id}>
              <TableCell>
                <div className="flex items-center gap-3">
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
                  <div>
                    <div className="font-medium">{app.app.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {app.app.developer}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{app.app.developer}</TableCell>
              <TableCell className="text-right">
                {app.app.current_rating}
              </TableCell>
              <TableCell className="text-right">
                {app.app.total_reviews}
              </TableCell>
              <TableCell>
                {app.app.last_synced_at
                  ? new Date(app.app.last_synced_at).toLocaleDateString()
                  : "Never"}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1.5">
                  {/* Rating Filter */}
                  {(app.filter_config.min_rating ||
                    app.filter_config.max_rating) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-accent-2/50 text-[#00ff8c] border border-[#00ff8c]/30">
                      <Star className="h-3 w-3 mr-1" />
                      {app.filter_config.min_rating ===
                      app.filter_config.max_rating
                        ? `${app.filter_config.min_rating}★`
                        : `${app.filter_config.min_rating}-${app.filter_config.max_rating}★`}
                    </span>
                  )}

                  {/* Date Range */}
                  {app.filter_config.date_range && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-accent-2/50 text-[#00ff8c] border border-[#00ff8c]/30">
                      <Calendar className="h-3 w-3 mr-1" />
                      {app.filter_config.date_range} days
                    </span>
                  )}

                  {/* Keywords Count */}
                  {app.filter_config.filter_keywords?.length > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-accent-2/50 text-[#00ff8c] border border-[#00ff8c]/30">
                      <Tag className="h-3 w-3 mr-1" />
                      {app.filter_config.filter_keywords.length} keywords
                      {app.filter_config.match_all_keywords ? " (ALL)" : ""}
                    </span>
                  )}

                  {/* Developer Replies */}
                  {app.filter_config.include_replies && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-accent-2/50 text-[#00ff8c] border border-[#00ff8c]/30">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Include replies
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(
                      `/dashboard/reviews/filters/${app.filter_config.id}`
                    )
                  }
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Filters
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
