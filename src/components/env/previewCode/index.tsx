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
        <p className="text-muted-foreground mt-4 text-center">
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

      <div className="flex flex-col items-center gap-12">
        <h2 className="text-center text-3xl font-bold">
          Want to Clean Your Logs? Try Humanlog for Free!
        </h2>

        <Button asChild>
          <Link href={"/pricing"}>Get started</Link>
        </Button>
      </div>
    </div>
  );
}

export function Demo() {
  const videoId = "44XDFtOOskU";
  return (
    <div className="container">
      <div>
        <h2 className="text-center text-4xl font-bold">
          {"Don't wait until production to leverage your logs."}
        </h2>
        <p className="text-muted-foreground mt-4 text-center">
          A full log search engine in local dev, all the way to production.
          <br />
          Humanlog makes your structured logs easier to read, and queryable.
        </p>
      </div>

      <div className="relative mx-auto mt-4 flex h-0 w-3/4 flex-col justify-center gap-7 py-16 pt-[56%] sm:flex-row">
        <iframe
          // width="738"
          // height="641"
          className="absolute top-0 left-0 h-full w-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}
