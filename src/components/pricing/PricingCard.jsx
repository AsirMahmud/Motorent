import { Check } from "lucide-react";
import React from "react";
import RrMark from "../shared/RrMark";

export default function PricingCard({ premium = false }) {
  const items = premium
    ? ["Unlimited Job Posts", "Instant Job Post Approval", "Premium List Placement", "Unlimited Job Applicants"]
    : ["1 Active Job", "Basic List Placement", "Unlimited Job Applicants", "Invite Anyone to Apply to Your Jobs"];

  return (
    <article className="reveal relative min-h-[343px] w-full overflow-hidden rounded-[28px] bg-white p-8 shadow-[-15px_50px_150px_rgba(49,89,211,0.12)] md:h-[260px] md:min-h-0 md:w-[337px] md:p-[22px] xl:h-[343px] xl:w-[500px] xl:p-8">
      <div className="flex h-[180px] w-full flex-col items-center justify-center rounded-2xl bg-[#ecf2ff] text-center md:h-[132px] md:w-[108px] xl:h-[180px] xl:w-[160px]">
        {premium && (
          <span className="absolute left-[39px] top-[10px] inline-flex h-11 items-center gap-2 rounded-full bg-[#c2eeff] px-1 pr-5 text-base font-semibold tracking-[0.4px] text-ink shadow-[0_4px_4px_rgba(67,145,193,0.21)] md:left-[27px] md:h-8 md:gap-1.5 md:pr-3 md:text-xs xl:left-[39px] xl:h-11 xl:gap-2 xl:pr-5 xl:text-base">
            <span className="flex size-9 items-center justify-center rounded-full bg-white md:size-7 xl:size-9">
              <RrMark className="h-4 w-5 md:h-3.5 md:w-[18px] xl:h-4 xl:w-5" />
            </span>
            Premium
          </span>
        )}
        <p className="bg-gradient-to-br from-brand-300 to-brand-800 bg-clip-text text-[32px] font-semibold leading-[45px] text-transparent md:text-[24px] xl:text-[32px]">
          {premium ? "$79.99" : "Free"}
        </p>
        <p className="text-[20px] font-medium leading-[35px] text-ink/40 md:text-[14px] xl:text-[20px]">
          {premium ? "Per Month" : "Basic"}
        </p>
      </div>
      <div className="mt-6 md:absolute md:left-[154px] md:right-5 md:top-[30px] md:mt-0 xl:left-56 xl:right-5 xl:top-[34px]">
        <ul className="space-y-4 md:space-y-[13px] xl:space-y-5">
          {items.map((item) => (
            <li key={item} className="flex min-h-6 items-start gap-3 text-[16px] font-medium leading-6 text-[#323445] md:min-h-4 md:gap-2 md:text-[11px] md:leading-4 xl:min-h-6 xl:gap-3 xl:text-[16px] xl:leading-6">
              <span
                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-white md:mt-0 md:size-4 xl:mt-0.5 xl:size-5 ${
                  !premium && item !== "1 Active Job" && item !== "Basic List Placement"
                    ? "bg-[#9499aa]"
                    : "bg-brand-500"
              }`}
              >
                <Check className="size-3 md:size-2.5 xl:size-3" strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <a
        href="#signin"
        className={`mt-7 flex h-[72px] items-center justify-center rounded-[24px] text-[20px] font-semibold leading-[26px] transition hover:-translate-y-0.5 hover:shadow-lift md:absolute md:bottom-[22px] md:left-[22px] md:right-[22px] md:mt-0 md:h-[50px] md:rounded-xl md:text-xs xl:bottom-8 xl:left-8 xl:right-8 xl:h-[72px] xl:rounded-[24px] xl:text-[20px] ${
          premium
            ? "bg-gradient-to-br from-brand-300 to-brand-800 text-white shadow-[10px_0_50px_rgba(49,89,211,0.28)]"
            : "border border-brand-500 bg-white text-brand-800"
        }`}
      >
        Get Started
      </a>
    </article>
  );
}
