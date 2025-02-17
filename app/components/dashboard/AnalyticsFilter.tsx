"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
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
}

export function AnalyticsFilter({
  apps,
  selectedApp,
  onAppChange,
}: AnalyticsFilterProps) {
  const [open, setOpen] = useState(false);
  const selectedAppName =
    apps.find((app) => app.id === selectedApp)?.name || "All Apps";

  return (
    <div className="flex">
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
    </div>
  );
}
