"use client";

import NewQueryInput from "@/components/env/new-query-input";
import NewQueryOutput from "@/components/env/new-query-output";
import { useState } from "react";

const LogInterface = () => {
  const [errMsg, setErrMsg] = useState("");

  return (
    <section>
      <div className="container-min-h-full flex flex-col gap-4 overflow-y-hidden py-8">
        <NewQueryInput errMsg={errMsg} />
        <NewQueryOutput setErrMsg={setErrMsg} />
      </div>
    </section>
  );
};

export default LogInterface;
