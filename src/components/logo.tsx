import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Logo: React.FC = () => {
  return (
    <Link href="/">
      <div className="flex flex-row items-center gap-1">
        <span className="text-[16px] text-white">human</span>
        <Button
          size="sm"
          className="h-8 border-darkBg px-2 text-[16px] shadow-[2px_2px_0_0_#fff] shadow-white dark:shadow-white"
        >
          log
        </Button>
        <span className="text-[16px] text-white">.io</span>
      </div>
    </Link>
  );
};

export default Logo;
