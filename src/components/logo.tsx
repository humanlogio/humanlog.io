import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Logo: React.FC = () => {
  return (
    <Link href="/">
      <div className="flex flex-row gap-1 items-center">
        <span className="text-white text-[16px]">human</span>
        <Button
          size="sm"
          className="px-2 h-8 text-[16px] border-darkBg shadow-[2px_2px_0_0_#fff]"
        >
          log
        </Button>
        <span className="text-white text-[16px]">.io</span>
      </div>
    </Link>
  );
};

export default Logo;
