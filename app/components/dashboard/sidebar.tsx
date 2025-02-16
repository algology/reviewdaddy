"use client";

import * as React from "react";
import {
  Home,
  BarChart,
  Settings,
  User2,
  Star,
  Filter,
  MessageSquare,
  Tags,
  AlertCircle,
  Search,
  Smartphone,
  PlusCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const menuItems = [
  {
    section: "Overview",
    items: [
      {
        title: "Dashboard",
        icon: Home,
        href: "/dashboard",
        tooltip: "Overview of all reviews",
      },
      {
        title: "Analytics",
        icon: BarChart,
        href: "/dashboard/analytics",
        tooltip: "Review metrics and trends",
      },
    ],
  },
  {
    section: "Apps",
    items: [
      {
        title: "My Apps",
        icon: Smartphone,
        href: "/dashboard/apps",
        tooltip: "Manage connected apps",
      },
      {
        title: "Add New App",
        icon: PlusCircle,
        href: "/dashboard/apps/new",
        tooltip: "Connect a new app",
      },
    ],
  },
  {
    section: "Review Management",
    items: [
      {
        title: "All Reviews",
        icon: MessageSquare,
        href: "/dashboard/reviews",
        tooltip: "Browse all app reviews",
      },
      {
        title: "By Rating",
        icon: Star,
        href: "/dashboard/reviews/ratings",
        tooltip: "Filter reviews by rating",
      },
      {
        title: "Search",
        icon: Search,
        href: "/dashboard/reviews/search",
        tooltip: "Search through reviews",
      },
      {
        title: "Filters",
        icon: Filter,
        href: "/dashboard/reviews/filters",
        tooltip: "Create custom review filters",
      },
    ],
  },
  {
    section: "Classification",
    items: [
      {
        title: "Tags",
        icon: Tags,
        href: "/dashboard/tags",
        tooltip: "Manage review tags",
      },
      {
        title: "Issues",
        icon: AlertCircle,
        href: "/dashboard/issues",
        tooltip: "Track reported issues",
      },
    ],
  },
];

export function DashboardSidebar() {
  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar collapsible="icon" className="absolute left-0">
        <div
          data-sidebar="sidebar"
          className="!bg-[#121212] flex h-full w-full flex-col"
        >
          <SidebarContent>
            {menuItems.map((section, index) => (
              <React.Fragment key={section.section}>
                {index > 0 && <SidebarSeparator />}
                <SidebarGroup>
                  <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
                    {section.section}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {section.items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <SidebarMenuButton asChild>
                                <a href={item.href}>
                                  <item.icon className="h-4 w-4 group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:w-4" />
                                  <span className="group-data-[collapsible=icon]:hidden">
                                    {item.title}
                                  </span>
                                </a>
                              </SidebarMenuButton>
                            </TooltipTrigger>
                            <TooltipContent
                              side="right"
                              align="center"
                              sideOffset={10}
                              className="group-data-[collapsible=expanded]:hidden"
                            >
                              {item.tooltip}
                            </TooltipContent>
                          </Tooltip>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </React.Fragment>
            ))}
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="group-data-[collapsible=icon]:p-2">
                      <User2 className="h-4 w-4 group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">
                        Account
                      </span>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="right"
                    align="start"
                    className="w-[200px]"
                  >
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </div>
      </Sidebar>
    </TooltipProvider>
  );
}
