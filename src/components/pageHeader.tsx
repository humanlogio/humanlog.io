import React from "react";
import Image from "next/image";
import Link from "next/link";
import { SquareCode } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const PageHeader: React.FC = () => {
  return (
    <div className="flex justify-center bg-darkBg px-4 py-3">
      <div className="flex flex-row justify-between items-center gap-8 w-full max-w-screen-xl">
        <div className="flex flex-row items-center gap-8">
          <Link href="/">
            <Image
              src="/images/humanlog-logo.png"
              width={128}
              height={32}
              alt="Humanlog.io logo"
            />
          </Link>
          <Select>
            <SelectTrigger className="w-52">
              <div className="flex flex-row items-center gap-2">
                <SquareCode size={20} />
                <SelectValue placeholder="Select source" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="localhost">localhost</SelectItem>
                <SelectItem value="staging">staging</SelectItem>
                <SelectItem value="production">production</SelectItem>
                <SelectItem value="add_new">+ Add new</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-row items-center gap-2">
          <p className="text-white font-medium">username</p>
          <Avatar>
            <AvatarImage src="https://i.pravatar.cc/64" />
            <AvatarFallback>SB</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
