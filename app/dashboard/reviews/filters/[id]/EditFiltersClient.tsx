"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface FilterKeyword {
  id: string;
  term: string;
  match_exact: boolean;
}

interface FilterConfig {
  id: string;
  user_id: string;
  name: string;
  min_rating: number | null;
  max_rating: number | null;
  match_all_keywords: boolean;
  date_range: string | null;
  include_replies: boolean;
  created_at: string;
  updated_at: string;
  filter_keywords: FilterKeyword[];
}

export default function EditFiltersClient({ filterId }: { filterId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [filterConfig, setFilterConfig] = useState<FilterConfig | null>(null);

  useEffect(() => {
    async function loadFilter() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("filter_configs")
        .select("*")
        .eq("id", filterId)
        .eq("user_id", session.user.id)
        .single();

      if (error) {
        toast({
          title: "Error loading filter",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setFilterConfig({
          id: data.id,
          user_id: data.user_id,
          name: data.name,
          min_rating: data.min_rating,
          max_rating: data.max_rating,
          match_all_keywords: data.match_all_keywords,
          date_range: data.date_range,
          include_replies: data.include_replies,
          created_at: data.created_at,
          updated_at: data.updated_at,
          filter_keywords: data.filter_keywords,
        });
      }
    }

    loadFilter();
  }, [filterId, router, toast]);

  if (!filterConfig) {
    return <div>Loading...</div>;
  }

  const handleSave = async () => {
    if (!filterConfig) return;

    try {
      const { error } = await supabase
        .from("filter_configs")
        .update({
          min_rating: filterConfig.min_rating,
          max_rating: filterConfig.max_rating,
          match_all_keywords: filterConfig.match_all_keywords,
          updated_at: new Date().toISOString(),
        })
        .eq("id", filterConfig.id);

      if (error) throw error;

      toast({
        title: "Filter updated",
        description: "Your changes have been saved",
      });

      router.push("/dashboard/reviews");
    } catch (error) {
      toast({
        title: "Error saving filter",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label>Minimum Rating</Label>
            <Input
              type="number"
              min={1}
              max={5}
              value={filterConfig.min_rating || ""}
              onChange={(e) =>
                setFilterConfig({
                  ...filterConfig,
                  min_rating: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Maximum Rating</Label>
            <Input
              type="number"
              min={1}
              max={5}
              value={filterConfig.max_rating || ""}
              onChange={(e) =>
                setFilterConfig({
                  ...filterConfig,
                  max_rating: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={filterConfig.match_all_keywords}
              onCheckedChange={(checked) =>
                setFilterConfig({
                  ...filterConfig,
                  match_all_keywords: checked,
                })
              }
            />
            <Label>Match all keywords</Label>
          </div>

          <Button onClick={handleSave}>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
