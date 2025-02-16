"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";

type App = Database["public"]["Tables"]["apps"]["Row"];

interface MonitoredApp {
  app: App;
}

export default function AppsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appToDelete, setAppToDelete] = useState<App | null>(null);

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

  const handleDeleteApp = async (app: App) => {
    try {
      // Start a transaction to ensure all deletes succeed or none do
      const { data: monitoredApp, error: fetchError } = await supabase
        .from("monitored_apps")
        .select(
          `
          id,
          filter_config_id,
          filter_configs (id)
        `
        )
        .eq("app_id", app.id)
        .single();

      if (fetchError) {
        console.error("Fetch error:", fetchError);
        throw fetchError;
      }

      if (!monitoredApp) {
        console.error("App not found in monitored_apps");
        throw new Error("App not found");
      }

      // Log the IDs we're about to delete
      console.log("Deleting:", {
        app_id: app.id,
        monitored_app_id: monitoredApp.id,
        filter_config_id: monitoredApp.filter_config_id,
      });

      // Delete in order of dependencies
      const deleteResults = await Promise.all([
        // 1. Delete matched reviews
        supabase
          .from("matched_reviews")
          .delete()
          .eq("filter_config_id", monitoredApp.filter_config_id),

        // 2. Delete filter keywords
        supabase
          .from("filter_keywords")
          .delete()
          .eq("filter_config_id", monitoredApp.filter_config_id),

        // 3. Delete monitored app
        supabase.from("monitored_apps").delete().eq("id", monitoredApp.id),

        // 4. Delete filter config
        supabase
          .from("filter_configs")
          .delete()
          .eq("id", monitoredApp.filter_config_id),

        // 5. Delete app
        supabase.from("apps").delete().eq("id", app.id),
      ]);

      // Check for any errors
      const errors = deleteResults.filter((result) => result.error);
      if (errors.length > 0) {
        console.error("Delete errors:", errors);
        throw new Error("Failed to delete one or more related records");
      }

      setApps((prevApps) => prevApps.filter((a) => a.id !== app.id));
      toast({
        title: "App removed",
        description: `${app.name} has been removed from monitoring`,
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error removing app",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Apps</h1>
          <p className="text-muted-foreground mt-1">
            Manage your monitored applications
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/apps/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Apps
        </Button>
      </div>

      {apps.length === 0 ? (
        <Card className="bg-[#121212]/95 backdrop-blur-sm border-accent-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-2 mb-6">
              <h3 className="text-lg font-medium">No apps monitored yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Start by adding your first app to monitor its reviews and get
                insights
              </p>
            </div>
            <Button onClick={() => router.push("/dashboard/apps/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First App
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map((app) => (
            <Card
              key={app.id}
              className="bg-[#121212]/95 backdrop-blur-sm border-accent-2"
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-accent-2/50 overflow-hidden relative">
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
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{app.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {app.developer}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <span>⭐ {app.current_rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">
                        {app.total_reviews.toLocaleString()} reviews
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setAppToDelete(app)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!appToDelete}
        onOpenChange={() => setAppToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove App</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to stop monitoring {appToDelete?.name}? This
              will delete all associated filters and review data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (appToDelete) {
                  handleDeleteApp(appToDelete);
                  setAppToDelete(null);
                }
              }}
            >
              Remove App
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
