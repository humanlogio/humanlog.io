"use client";

import React from "react";

// Import all section components
import FAQSection from "@/components/landing-page/sections/faq-section";
import DemoSection from "@/components/landing-page/sections/demo-section";
import FeatureGridSection from "@/components/landing-page/sections/feature-grid-section";
import CommunitySection from "@/components/landing-page/sections/community-section";
import CTABannerSection from "@/components/landing-page/sections/cta-banner-section";

const BelowFold: React.FC = () => {
  return (
    <div className="flex w-full flex-col gap-48 py-44 lg:gap-72 lg:py-60">
      {/* 1. Frequently Asked Questions */}
      <FAQSection />
      
      {/* 2. Demo Mode Data Ingestion */}
      <DemoSection />
      
      {/* 3. Core Feature Grid */}
      <FeatureGridSection />
      
      {/* 4. Community & Support Callout */}
      <CommunitySection />
      
      {/* 5. Final Conversion Banner */}
      <CTABannerSection />
    </div>
  );
};

export default BelowFold;
