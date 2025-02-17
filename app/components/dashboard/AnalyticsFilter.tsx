"use client";

import { Check, ChevronsUpDown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "cmdk";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface App {
  id: string;
  name: string;
}

interface AnalyticsFilterProps {
  apps: App[];
  selectedApp: string | null;
  onAppChange: (appId: string | null) => void;
  dateRange: number;
  onDateRangeChange: (days: number) => void;
}

export function AnalyticsFilter({
  apps,
  selectedApp,
  onAppChange,
  dateRange,
  onDateRangeChange,
}: AnalyticsFilterProps) {
  const [open, setOpen] = useState(false);
  const selectedAppName =
    apps.find((app) => app.id === selectedApp)?.name || "All Apps";

  return (
    <div className="flex items-center gap-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="min-w-[200px] w-full justify-between bg-[#121212]/95 backdrop-blur-sm border-accent-2 hover:bg-accent-2/20 text-sm"
          >
            {selectedAppName}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="min-w-[200px] w-full p-0 bg-[#121212]/95 backdrop-blur-sm border-accent-2">
          <Command className="bg-transparent">
            <CommandList>
              <CommandEmpty className="py-2 text-xs text-muted-foreground">
                No apps found.
              </CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    onAppChange(null);
                    setOpen(false);
                  }}
                  className="flex items-center px-2 py-1.5 hover:bg-accent-2/20 text-xs cursor-pointer hover:text-[#00ff8c]"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      !selectedApp ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>All Apps</span>
                </CommandItem>
                {apps.map((app) => (
                  <CommandItem
                    key={app.id}
                    onSelect={() => {
                      onAppChange(app.id);
                      setOpen(false);
                    }}
                    className="flex items-center px-2 py-1.5 hover:bg-accent-2/20 text-xs cursor-pointer hover:text-[#00ff8c]"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedApp === app.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span>{app.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-[#00ff8c]" />
        <div className="relative">
          <select
            className="appearance-none bg-[#121212]/95 backdrop-blur-sm border-accent-2 rounded-md p-2 pr-8 text-sm hover:bg-accent-2/20"
            value={dateRange}
            onChange={(e) => onDateRangeChange(Number(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 3 months</option>
            <option value={180}>Last 6 months</option>
            <option value={365}>Last year</option>
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}
