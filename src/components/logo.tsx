import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Logo = (props: { small?: boolean }) => {
  const sizeStyle = props.small ? " scale-75 md:-translate-x-[12.5%]" : "";

  return (
    <Link href="/">
      <div
        className={"flex flex-row items-center gap-1" + sizeStyle}
        title="humanlog.io home link"
      >
        <span className="text-[16px] text-white">human</span>
        <Button
          size="sm"
          className="h-8 border-darkBg px-2 text-[16px] shadow-[2px_2px_0_0_#fff] shadow-white dark:shadow-white"
        >
          log
        </Button>
        <span className="text-[16px] text-white">
          {process.env.NODE_ENV === "development" ? ".dev" : ".io"}
        </span>
      </div>
    </Link>
  );
};

export default Logo;
