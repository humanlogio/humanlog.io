import { execSync } from "child_process";

export default async () => {
  console.log("Running SSL setup...");
  execSync("./script/setup-localhost", { stdio: "inherit" });
};
