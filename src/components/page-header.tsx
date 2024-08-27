import React from "react";
import { SquareCode } from "lucide-react";

import Logo from "@/components/logo";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";

const PageHeader: React.FC = () => {
  return (
    <div className="bg-darkBg dark:bg-secondary-900">
      <div className="mx-auto flex w-full max-w-screen-xl flex-row items-center justify-between gap-8 px-4 py-3">
        <div className="flex flex-row items-center gap-8">
          <Logo />
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
        <div className="flex flex-row items-center gap-6">
          <div className="flex flex-row items-center gap-2">
            <p className="font-medium text-white">username</p>
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/64" />
              <AvatarFallback>SB</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-row items-center gap-2">
            <ModeToggle />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
