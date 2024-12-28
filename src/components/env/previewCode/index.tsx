import dynamic from "next/dynamic";

const AsciinemaPlayer = dynamic(() => import("@/components/asciinemaPlayer"), {
  ssr: false,
});

export default function PreviewCode() {
  const rowLogSrc = "/asciinema/raw_logs.cast";
  const prettyLogsSrc = "/asciinema/pretty_logs.cast";

  return (
    <div className="container">
      <div>
        <h1 className="text-center text-4xl font-bold">
          See the Difference Humanlog Makes
        </h1>
        <p className="mt-4 text-center text-slate-500">
          Messy logs? No problem. <br />
          This is how Humanlog transforms raw, chaotic logs into clean,
          human-readable insights.{" "}
        </p>
      </div>

      <div className="flex flex-col justify-center gap-7 py-20 sm:flex-row">
        <div className="w-full sm:w-1/2">
          <AsciinemaPlayer src={rowLogSrc} />
        </div>
        <div className="w-full sm:w-1/2">
          <AsciinemaPlayer src={prettyLogsSrc} />
        </div>
      </div>
    </div>
  );
}
