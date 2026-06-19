import { Bell, X } from "lucide-react";
import React from "react";
import asset from "../../utils/assets";
import RrMark from "../shared/RrMark";
import PricingCard from "./PricingCard";

const socialLinks = [
  { src: "social-facebook.svg", label: "Facebook" },
  { src: "social-instagram.svg", label: "Instagram" },
  { icon: "x", label: "X" },
  { src: "social-twitter.svg", label: "Twitter" },
  { src: "social-linkedin.svg", label: "LinkedIn" },
  { icon: "bell", label: "Notifications" },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative overflow-hidden pb-0 pt-16 md:pt-[60px] xl:pb-[56px] xl:pt-[52px]">
      <div className="absolute bottom-0 left-0 right-0 h-[530px] overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-[#3679af] md:h-[380px] xl:h-[535px]">
        <svg
          className="absolute -top-px left-0 h-[170px] w-full md:h-[134px] xl:h-[220px]"
          viewBox="0 0 1440 220"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 0C190 0 306 0 430 55C574 119 682 210 840 210C1038 210 1194 174 1440 184V0H0Z"
            fill="white"
          />
        </svg>
        <div className="absolute right-[-120px] top-[118px] size-[320px] rounded-full bg-white/5 md:right-[66px] md:top-[46px] md:size-[298px] xl:right-[79px] xl:top-[88px] xl:size-[380px]" />
        <div className="absolute left-[-120px] bottom-[-150px] size-[360px] rounded-full bg-white/5 md:left-[70px] md:bottom-[-260px] md:size-[420px] xl:left-[72px] xl:bottom-[-225px] xl:size-[524px]" />
      </div>
      <div className="container-page relative z-10">
        <h2 className="reveal text-center text-[32px] font-medium leading-tight text-ink md:text-[28px] xl:text-[40px]">
          Help Is One Click Away
        </h2>
        <div className="mx-auto mt-8 grid max-w-[1040px] gap-6 md:mt-[36px] md:max-w-[700px] md:grid-cols-2 md:gap-[26px] xl:mt-[30px] xl:max-w-[1040px] xl:gap-10">
          <PricingCard />
          <PricingCard premium />
        </div>
        <div className="mt-16 border-b border-[#8ba3cc]/50 pb-12 text-white md:mt-[66px] md:pb-[62px] xl:mt-[104px] xl:pb-[100px]">
          <div className="mx-auto flex flex-col items-center justify-between gap-8 text-center md:max-w-[700px] md:flex-row md:items-center md:gap-10 md:text-left xl:max-w-[1040px]">
            <img
              src={asset("logo-remote-recruit.svg")}
              alt="RemoteRecruit"
              className="h-[66px] w-[164px] object-contain md:h-[56px] md:w-[140px] xl:h-[74px] xl:w-[184px]"
              loading="lazy"
            />
            <div className="flex items-center justify-center gap-4 md:gap-2.5 xl:gap-4">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href="#top"
                  aria-label={item.label}
                  className="flex size-8 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 md:size-6 xl:size-8"
                >
                  {item.src ? (
                    <img
                      src={asset(item.src)}
                      alt=""
                      className="size-[18px] md:size-[13px] xl:size-[18px]"
                      loading="lazy"
                    />
                  ) : item.icon === "x" ? (
                    <X className="size-[15px] md:size-[11px] xl:size-[15px]" />
                  ) : (
                    <Bell className="size-[15px] md:size-[11px] xl:size-[15px]" />
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="flex h-[64px] items-center justify-center md:h-[50px] xl:h-[64px]">
          <RrMark className="h-[24px] w-[30px] shrink-0 md:h-[21px] md:w-[26px] xl:h-[24px] xl:w-[30px]" />
        </div>
      </div>
    </section>
  );
}
