import React from "react";
import FeatureVisual from "./FeatureVisual";

export default function FeatureSection({ feature }) {
  const isProfile = feature.visual === "profile";

  return (
    <section
      id={feature.visual === "jobs" ? "features" : undefined}
      className={`container-page py-12 sm:py-16 ${
        isProfile ? "lg:py-[34px]" : "lg:py-[85px]"
      }`}
    >
      <div
        className={`grid items-center gap-9 sm:gap-12 lg:grid-cols-[500px_451px] lg:gap-[67px] ${
          feature.reverse ? "lg:grid-cols-[451px_500px]" : ""
        }`}
      >
        <div
          className={`reveal ${feature.reverse ? "lg:order-2" : ""} ${
            isProfile ? "lg:self-start lg:pt-[47px]" : ""
          }`}
        >
          <span className="pill">{feature.eyebrow}</span>
          <h2 className="mt-7 text-[30px] font-medium leading-tight text-ink sm:mt-9 sm:text-[40px] sm:leading-[52px]">
            {feature.title}
          </h2>
          <p className="mt-5 text-[16px] leading-8 text-ink/60 sm:mt-7 sm:text-[19px] sm:leading-[35px]">
            {feature.body}
          </p>
        </div>
        <div className={`reveal ${feature.reverse ? "lg:order-1" : ""}`}>
          <FeatureVisual type={feature.visual} />
        </div>
      </div>
    </section>
  );
}
