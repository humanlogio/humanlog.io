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
    <section className="mx-auto max-w-3xl py-16 px-4">
      <h2 className="mb-8 text-center text-3xl font-bold">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqItems.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>
              {item.answer}{" "}
              <a href={item.linkHref} className="text-primary underline">{item.linkText}</a>.
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default FAQSection;
