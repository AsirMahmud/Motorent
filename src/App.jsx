import React from "react";
import CtaSection from "./components/cta/CtaSection";
import FeatureSection from "./components/features/FeatureSection";
import Hero from "./components/hero/Hero";
import Header from "./components/layout/Header";
import Pricing from "./components/pricing/Pricing";
import Questions from "./components/questions/Questions";
import ScrollTopButton from "./components/scroll/ScrollTopButton";
import features from "./data/features";
import useReveal from "./hooks/useReveal";

export default function App() {
  useReveal();

  return (
    <main className="overflow-hidden bg-white">
      <Header />
      <Hero />
      <div className="-mt-px">
        {features.map((feature) => (
          <FeatureSection key={feature.title} feature={feature} />
        ))}
      </div>
      <CtaSection />
      <Questions />
      <Pricing />
      <ScrollTopButton />
    </main>
  );
}
