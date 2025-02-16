"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  BarChart,
  Star,
  TrendingUp,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

const metrics = [
  {
    title: "Total Reviews",
    value: "1,234",
    change: "+12.3%",
    trend: "up",
    icon: MessageSquare,
  },
  {
    title: "Average Rating",
    value: "4.2",
    change: "+0.3",
    trend: "up",
    icon: Star,
  },
  {
    title: "Potential Leads",
    value: "89",
    change: "+5.2%",
    trend: "up",
    icon: TrendingUp,
  },
  {
    title: "Critical Issues",
    value: "23",
    change: "-2.1%",
    trend: "down",
    icon: AlertCircle,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <div className="flex items-center gap-4">
          {/* Add period selector here later */}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card
            key={metric.title}
            className="bg-[#121212]/95 backdrop-blur-sm border-accent-2 hover:bg-[#121212]/80 transition-colors"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-lg bg-[#00ff8c]/10 border border-[#00ff8c]/20 flex items-center justify-center">
                  <metric.icon className="w-6 h-6 text-[#00ff8c]" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    metric.trend === "up" ? "text-[#00ff8c]" : "text-red-500"
                  }`}
                >
                  {metric.change}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </h3>
                <p className="text-2xl font-bold mt-1 text-foreground">
                  {metric.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-[#121212]/95 backdrop-blur-sm border-accent-2">
          <CardHeader>
            <h3 className="text-lg font-medium">Review Sentiment Trend</h3>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Chart placeholder
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#121212]/95 backdrop-blur-sm border-accent-2">
          <CardHeader>
            <h3 className="text-lg font-medium">Top Issues</h3>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Chart placeholder
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
