import AsciinemaPlayer from "@/components/asciinemaPlayer";


export default function PreviewCode() {
  const rowLogSrc = '/asciinema/raw_logs.cast';
  const prettyLogsSrc = '/asciinema/pretty_logs.cast';

  return (
    <section>
      <div>
        <h1 className="text-center text-4xl font-bold">See the Difference Humanlog Makes</h1>
        <p className="mt-4 text-center text-slate-500">
          Messy logs? No problem. <br />
          This is how Humanlog transforms raw, chaotic logs into clean, human-readable insights.        </p>
      </div>

      <div className="flex justify-center gap-10 py-10">
        <div className="w-2/5">
          <AsciinemaPlayer src={rowLogSrc} />
        </div>
        <div className="w-2/5">
          <AsciinemaPlayer src={prettyLogsSrc} />
        </div>
      </div>


    </section>
  );

}