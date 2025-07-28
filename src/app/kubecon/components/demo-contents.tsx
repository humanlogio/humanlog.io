interface DemoContentsProps {
  gift: string;
}

export default function DemoContents({ gift }: DemoContentsProps) {
  const videoId = "WtoA4VGWgCk";
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="rounded-xl p-8 md:p-12 dark:from-gray-800 dark:to-gray-700">
              <h3 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl dark:text-white">
                Hello KubeCon India 🇮🇳
              </h3>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                We&apos;re the team behind Humanlog. Thanks for booking a demo
                with us! Your help is hugely important in shaping our product
                and crafting the best DevEx for observability!
                <br />
                As a token of our gratitude, we&apos;ll offer you a {gift}!
              </p>
              <a
                href="https://calendly.com/antoine-webscale/kubecon-ux-research"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex transform items-center rounded-lg bg-gray-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-700 hover:shadow-xl focus:ring-4 focus:ring-gray-300 focus:outline-none dark:bg-gray-500 dark:hover:bg-gray-600 dark:focus:ring-gray-800"
              >
                Book a Demo
                <svg
                  className="ml-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </a>
            </div>
          </div>
          {/* Video Section */}
          <div className="relative mt-12 w-full">
            <div className="aspect-video w-full overflow-hidden rounded-lg shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`}
                title="YouTube video player"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
