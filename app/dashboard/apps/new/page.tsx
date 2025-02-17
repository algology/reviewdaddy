"use client";

import { useState } from "react";
import { Search, Smartphone, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface PlayStoreApp {
  id: string;
  name: string;
  icon: string;
  developer: string;
  rating: number;
  reviews: number;
  description: string;
  installs: string;
  lastUpdated: string;
}

export default function NewAppPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlayStoreApp[]>([]);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    if (query.length < 3) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/playstore/search?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error("Failed to search apps");

      const data = await response.json();
      setSearchResults(data.apps);
    } catch (error) {
      setError("Failed to search apps. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleAppSelection = (appId: string) => {
    setSelectedApps((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId]
    );
  };

  const handleContinue = () => {
    if (selectedApps.length === 0) return;

    // Store selected apps in session storage for the next step
    sessionStorage.setItem(
      "selectedApps",
      JSON.stringify(
        searchResults.filter((app) => selectedApps.includes(app.id))
      )
    );

    router.push("/dashboard/apps/new/configure");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Add New Apps</h1>
          <p className="text-muted-foreground mt-1">
            Search and select the apps you want to track reviews for
          </p>
        </div>
      </div>

      <Card className="bg-[#121212]/95 backdrop-blur-sm border-accent-2">
        <CardHeader>
          <h3 className="text-lg font-medium">Search Google Play Store</h3>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Enter app name..."
              className="pl-9 bg-sidebar-accent/40 border-accent-2"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
            />
          </div>

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive-foreground">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-4">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : searchResults.length === 0 && searchQuery.length >= 3 ? (
              <div className="text-center py-8 text-muted-foreground">
                No apps found matching your search
              </div>
            ) : (
              searchResults.map((app) => (
                <div
                  key={app.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    selectedApps.includes(app.id)
                      ? "border-[#00ff8c]/50 bg-[#00ff8c]/5"
                      : "border-accent-2 bg-accent-1/50"
                  } hover:border-[#00ff8c]/30 transition-colors cursor-pointer`}
                  onClick={() => toggleAppSelection(app.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-accent-2/50 overflow-hidden relative">
                      <img
                        src={app.icon}
                        alt={app.name}
                        className="w-full h-full object-cover relative z-10"
                        loading="lazy"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null; // Prevent infinite loop
                          target.src = "/placeholder-app-icon.png";
                          target.classList.add("opacity-50");
                        }}
                      />
                      <div className="absolute inset-0 bg-accent-2/30 z-0" />
                    </div>
                    <div>
                      <h4 className="font-medium">{app.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {app.developer}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {app.rating.toFixed(1)} ★
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {app.reviews.toLocaleString()} reviews
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {selectedApps.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {selectedApps.length} app{selectedApps.length > 1 ? "s" : ""}{" "}
            selected
          </p>
          <Button
            onClick={handleContinue}
            className="bg-[#00ff8c] text-black hover:bg-[#00cf8a]"
          >
            Configure Filters
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
