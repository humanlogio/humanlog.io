import { md5 } from "js-md5";

export const gravatarURL = (email: string | undefined) => {
  if (!email) return undefined;
  return `https://www.gravatar.com/avatar/${md5(email)}`;
};
