import Link from "next/link";
import { Button } from "@/components/ui/button";
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
          human-readable insights.
        </p>
      </div>

      <div className="mx-auto flex max-w-screen-xl flex-col justify-center gap-7 py-16 sm:flex-row">
        <div className="w-full sm:w-1/2">
          <AsciinemaPlayer src={rowLogSrc} />
        </div>
        <div className="w-full sm:w-1/2">
          <AsciinemaPlayer src={prettyLogsSrc} />
        </div>
      </div>

      <div className="grid gap-12">
        <h2 className="text-center text-3xl font-bold">
          Want to Clean Your Logs? Try Humanlog for Free!
        </h2>
        <Link
          href={"/pricing"}
          style={{ width: "max-content", margin: "auto" }}
        >
          <Button
            size="lg"
            className="h-8 border-darkBg px-2 text-[16px] shadow-[2px_2px_0_0_#000000] shadow-black dark:shadow-black"
            style={{ padding: "20px 25px" }}
          >
            Get started
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function Demo() {
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
          human-readable insights.
        </p>
      </div>

      <div className="mx-auto flex max-w-screen-xl flex-col justify-center gap-7 py-16 sm:flex-row">
        <iframe
          width="738"
          height="641"
          src="https://www.youtube.com/embed/44XDFtOOskU"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}
