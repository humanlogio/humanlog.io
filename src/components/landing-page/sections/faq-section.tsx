"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CodeBlock, { InlineCode } from "@/components/landing-page/shared/ui/code-block";
import TerminalBlock from "@/components/landing-page/shared/ui/terminal-block";
import CloudBetaSignup from "@/components/landing-page/shared/cloud-beta-signup";
import FeatureFlag from "@/components/posthog/feature-flag";

// FAQ item interface
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  linkText?: string | null;
  linkHref?: string | null;
  customContent?: boolean;
}

// FAQ data structure for easy maintenance
const faqItems: FAQItem[] = [
  {
    id: "data-privacy",
    question: "Does my data ever leave my laptop?",
    answer: "No, all your data stays local by default. Humanlog processes everything on your machine, and you control when and what to share.",
    linkText: "Learn more about our privacy approach",
    linkHref: "/docs/privacy"
  },
  {
    id: "safety",
    question: "Is it safe to use?",
    answer: "It's as safe to use on your laptop as jq or other CLI tools that work with data. If you would use awk, grep, or jq to slice and dice your data, you can use humanlog. As long as you don't purposefully click 'Share results' your data will never leave your machine.",
    linkText: "View our privacy policy",
    linkHref: "/privacy"
  },
  {
    id: "sharing",
    question: "How can I share what I find with my friends and colleagues?",
    answer: "You can easily share your queries or results with our sharable link feature. Send links to key findings so teammates can reproduce them.",
    linkText: "Learn about sharing",
    linkHref: "/docs/sharing"
  },
  {
    id: "logs-vs-traces",
    question: "What's the difference between logs and traces?",
    answer: "Logs are point-in-time events, while traces show the path of a request through your system with timing and relationships.",
    linkText: "Read our observability concepts guide",
    linkHref: "/docs/concepts"
  },
  {
    id: "existing-logging",
    question: "Will Humanlog work with my existing logging setup?",
    answer: "Yes! Humanlog supports standard log formats (JSON, logfmt) and OpenTelemetry (OTLP) for traces.",
    linkText: "View all integrations",
    linkHref: "/docs/integrations"
  },
  {
    id: "docker-usage",
    question: "How do I use Humanlog with Orbstack, Docker, or other container runtimes?",
    answer: "To use Humanlog with containerized applications, set OTEL_EXPORTER_OTLP_ENDPOINT to http://host.docker.internal:4317 in your container environment variables.",
    linkText: "View container integration details",
    linkHref: "/docs/integrations/containers"
  },
  {
    id: "query-language",
    question: "How can I learn more about the query language?",
    answer: "Humanlog's query language is a pipeline-based language, inspired by KustoQL™. It's powerful for filtering, aggregating, and analyzing observability data.",
    linkText: "Read the query language reference with examples",
    linkHref: "/docs/reference/reference"
  },
  {
    id: "linux-support",
    question: "Does Humanlog support Linux?",
    answer: "Yes, Humanlog works on Linux but doesn't have a polished background service and menu-bar integration yet. Users can manually run the service with 'humanlog service run' or create a systemd service.",
    linkText: "View Linux installation details",
    linkHref: "/docs/get-started/installation"
  },
  {
    id: "windows-support",
    question: "Does Humanlog support Windows?",
    answer: "We don't publish binaries for Windows at this time because of the complexities of cross-compiling. Contributions are welcomed in the repository.",
    linkText: "View our GitHub repository",
    linkHref: "/link/github"
  },
  {
    id: "pricing",
    question: "How much does Humanlog cost?",
    answer: "Humanlog Local is free for personal use and open core. You can use it for business purpose if you obtain a license.",
    linkText: "See pricing details",
    linkHref: "/pricing"
  },
  {
    id: "hosted-version",
    question: "Is there a hosted version of Humanlog?",
    answer: "Yes! We're working on a hosted solution for teams that need managed infrastructure.",
    linkText: null,
    linkHref: null,
    customContent: true
  }
];

const FAQSection: React.FC = () => {
  return (
    <section className="w-full py-8">
      <div className="container mx-auto max-w-5xl px-4">
        <h2 className="mb-8 text-center text-3xl font-bold">Frequently Asked Questions</h2>
        
        <Accordion 
          type="single" 
          collapsible 
          className="w-full border border-zinc-200 rounded-lg overflow-hidden divide-y dark:border-zinc-800"
        >
          {faqItems.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="border-none px-0">
              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-zinc-50 dark:hover:bg-zinc-900">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="px-5 py-2 bg-zinc-50/50 dark:bg-zinc-900/50">
                {item.id === "hosted-version" ? (
                  <>
                    <p>Yes! We're working on a hosted solution for teams that need managed infrastructure.</p>
                    <div className="mt-4">
                      <CloudBetaSignup 
                        heading="Join the Humanlog Cloud waitlist for our managed service."
                        className="mt-2"
                      />
                    </div>
                  </>
                ) : item.id === "docker-usage" ? (
                  <>
                    <p>
                      To use Humanlog with containerized applications, set <InlineCode>OTEL_EXPORTER_OTLP_ENDPOINT</InlineCode> to <InlineCode>http://host.docker.internal:4317</InlineCode> in your container environment variables.
                    </p>
                    <TerminalBlock
                      commands={{
                        bash: "export OTEL_EXPORTER_OTLP_ENDPOINT=http://host.docker.internal:4317",
                        fish: "set -x OTEL_EXPORTER_OTLP_ENDPOINT http://host.docker.internal:4317"
                      }}
                    />
                    {item.linkText && item.linkHref && (
                      <><a href={item.linkHref} className="text-primary underline">{item.linkText}</a>.</>
                    )}
                  </>
                ) : item.id === "linux-support" ? (
                  <>
                    <p>
                      Yes, Humanlog works on Linux but doesn't have a polished background service and menu-bar integration yet. Users can manually run the service with <InlineCode>humanlog service run</InlineCode> or create a systemd service.
                    </p>
                    <TerminalBlock
                      commands={{
                        bash: "humanlog service run",
                        fish: "humanlog service run"
                      }}
                    />
                    {item.linkText && item.linkHref && (
                      <><a href={item.linkHref} className="text-primary underline">{item.linkText}</a>.</>
                    )}
                  </>
                ) : (
                  <>
                    {item.answer}{" "}
                    {item.linkText && item.linkHref && (
                      <><a href={item.linkHref} className="text-primary underline">{item.linkText}</a>.</>
                    )}
                    {item.id === "query-language" && (
                      <div className="mt-2 text-xs text-muted-foreground/50">
                        KustoQL is a trademark of Microsoft.
                      </div>
                    )}
                  </>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
