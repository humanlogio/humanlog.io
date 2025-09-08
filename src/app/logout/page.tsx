"use client";

import LoadingIndicator from "@/components/loading-indicator";
import { useAllEnvironments } from "@/context/list-environments";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Logout() {
  const router = useRouter();
  const { setUserInfo } = useAllEnvironments();

  useEffect(() => {
    setUserInfo(undefined);
    router.push("/");
  }, []);

  return <LoadingIndicator />;
}
