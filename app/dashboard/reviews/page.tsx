"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Star,
  ChevronDown,
  ExternalLink,
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

type App = Database["public"]["Tables"]["apps"]["Row"];

interface MonitoredApp {
  app: App;
  filter_configs: { user_id: string }[];
}

export default function ReviewsPage() {
  const router = useRouter();
  const [apps, setApps] = useState<App[]>([]);
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

      const { data: monitoredApps, error } = await supabase
        .from("monitored_apps")
        .select(
          `
          app:apps!inner (
            id,
            play_store_id,
            name,
            developer,
            icon_url,
            current_rating,
            total_reviews,
            last_synced_at
          ),
          filter_configs!inner (user_id)
        `
        )
        .eq("filter_configs.user_id", session.user.id);

      if (!error && monitoredApps) {
        const extractedApps = (monitoredApps as unknown as MonitoredApp[])
          .map((ma) => ma.app)
          .filter((app): app is App => app !== null);
        setApps(extractedApps);
      }
      setIsLoading(false);
    }

    loadApps();
  }, [router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Review Monitor</h1>
          <p className="text-muted-foreground mt-1">
            Monitoring {apps.length} app{apps.length !== 1 ? "s" : ""}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filter Settings
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => router.push(`/dashboard/reviews/filters`)}
            >
              Edit Filters
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>App</TableHead>
            <TableHead className="text-right">Rating</TableHead>
            <TableHead className="text-right">Total Reviews</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apps.map((app) => (
            <TableRow key={app.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-2/50 overflow-hidden relative">
                    <img
                      src={app.icon_url}
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
                  <div>
                    <div className="font-medium">{app.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {app.developer}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">{app.current_rating}</TableCell>
              <TableCell className="text-right">
                {app.total_reviews.toLocaleString()}
              </TableCell>
              <TableCell>
                {app.last_synced_at
                  ? new Date(app.last_synced_at).toLocaleDateString()
                  : "Never"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
