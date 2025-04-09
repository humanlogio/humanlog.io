import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import config from "@/features/config";

const Logo = ({ sm = false }) => {
  return (
    <Link href="/">
      <div
        className={cn(
          "flex flex-row items-center gap-1",
          sm && "-translate-x-[5%] scale-90",
        )}
        title="humanlog.io home link"
      >
        <span className="text-[16px]">human</span>
        <Button size="sm" className="h-8 px-2 text-[16px]">
          log
        </Button>
        <span className="text-[16px]">{config.TLD}</span>
      </div>
    </Link>
  );
};

export default Logo;
