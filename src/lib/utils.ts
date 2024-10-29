import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { md5 } from "js-md5";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const gravatarURL = (email: string | undefined) => {
  if (!email) return undefined;
  return `https://www.gravatar.com/avatar/${md5(email)}`;
};
