"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  return (
    <Tabs value={theme} onValueChange={setTheme}>
      <TabsList className="h-8">
        <TabsTrigger value="system">
          <SunMoon size={15} />
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
