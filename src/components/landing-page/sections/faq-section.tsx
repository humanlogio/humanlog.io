"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// FAQ data structure for easy maintenance
const faqItems = [
  {
    id: "data-privacy",
    question: "Does my data ever leave my laptop?",
    answer: "No, all your data stays local by default. Humanlog processes everything on your machine, and you control when and what to share.",
    linkText: "Learn more about our privacy approach",
    linkHref: "/docs/privacy"
  },
  {
    id: "cloud-queries",
    question: "How do I lift queries into Cloud?",
    answer: "You can easily share your queries or results with our sharable link feature. The same queries work locally and in Cloud with zero changes.",
    linkText: "See Cloud documentation",
    linkHref: "/docs/cloud"
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
    id: "pricing",
    question: "How much does Humanlog cost?",
    answer: "Humanlog Local is completely free and open source. Cloud features have a generous free tier and pay-as-you-go options.",
    linkText: "See pricing details",
    linkHref: "/pricing"
  }
];

const FAQSection: React.FC = () => {
  return (
    <section className="w-full py-16">
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
                {item.answer}{" "}
                <a href={item.linkHref} className="text-primary underline">{item.linkText}</a>.
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
