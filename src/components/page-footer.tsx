import Link from "next/link";

const PageFooter: React.FC = () => {
  return (
    <footer className="bg-darkBg dark:bg-slate-950">
      <div className="mx-auto flex max-w-screen-xl flex-col justify-between gap-8 px-4 py-16 md:flex-row">
        <p className="text-white">
          WebScale LLC, 2024. Humanlog.io © All rights reserved.
        </p>
        <div className="flex flex-col gap-8 md:flex-row">
          <Link href="#" className="text-white hover:underline">
            Link 1
          </Link>
          <Link href="#" className="text-white hover:underline">
            Link 1
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default PageFooter;
