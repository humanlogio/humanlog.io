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
    <div className="flex w-full flex-col gap-16 py-12 lg:gap-20 lg:py-16">
      {/* 1. Demo Mode Data Ingestion */}
      <DemoSection />
      
      {/* 2. Core Feature Grid */}
      <FeatureGridSection />
      
      {/* 3. Community & Support Callout */}
      <CommunitySection />
      
      {/* 4. Frequently Asked Questions */}
      <FAQSection />
      
      {/* 5. Final Conversion Banner */}
      <CTABannerSection />
    </div>
  );
};

export default BelowFold;
