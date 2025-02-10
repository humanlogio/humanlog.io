"use client";

import NewQueryInput from "./new-query-input";
import NewQueryOutput from "./new-query-output";

const LogInterface = () => {
  return (
    <section>
      <div className="container-min-h-full flex flex-col gap-4 overflow-y-hidden py-8">
        <NewQueryInput />
        <NewQueryOutput />
      </div>
    </section>
  );
};

export default LogInterface;
