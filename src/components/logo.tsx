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
        <span className="text-[16px] text-white">human</span>
        <Button
          size="sm"
          className="border-darkBg h-8 px-2 text-[16px] shadow-[2px_2px_0_0_#fff] shadow-white dark:shadow-white"
        >
          log
        </Button>
        <span className="text-[16px] text-white">{config.TLD}</span>
      </div>
    </Link>
  );
};

export default Logo;
