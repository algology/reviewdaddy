"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/app/components/dashboard/sidebar";
import { DashboardHeader } from "@/app/components/dashboard/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="dark flex min-h-screen w-screen">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader />
          <main className="p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
