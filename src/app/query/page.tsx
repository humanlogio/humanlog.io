import NewQueryOutput from "@/components/env/new-query-output";
import NewQueryInput from "@/components/env/new-query-input";

const Query = () => {
  return (
    <section>
      <div className="container-min-h-full flex flex-col gap-4 overflow-y-hidden py-8">
        <NewQueryInput />
        <NewQueryOutput />
      </div>
    </section>
  );
};

export default Query;
