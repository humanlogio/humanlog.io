"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonitorSmartphone, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="bg-muted h-8 w-[120px] animate-pulse rounded-md" />;
  }
  return (
    <Tabs value={theme} onValueChange={setTheme}>
      <TabsList className="h-8">
        <TabsTrigger value="system">
          <MonitorSmartphone size={15} />
        </TabsTrigger>
        <TabsTrigger value="light">
          <Sun size={15} />
        </TabsTrigger>
        <TabsTrigger value="dark">
          <Moon size={15} />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
