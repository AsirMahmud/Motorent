import { Check } from "lucide-react";
import React from "react";
import asset from "../../utils/assets";
import RrMark from "../shared/RrMark";

const membershipItems = [
  "Up to 25 active job posts",
  "Premium Placement & Visibility",
  "Messaging anyone, unlimited",
  "Unlimited invites",
  "View all applicants",
  "Unlimited invites to jobseekers",
];

export default function MembershipVisual() {
  return (
    <div className="relative mx-auto h-[432px] w-full max-w-[342px] sm:h-[454px] sm:max-w-[451px]">
      <span className="absolute left-3 top-0 size-[18px] rounded-full bg-gradient-to-br from-brand-300 to-brand-800 sm:left-7 sm:size-[22px]" />
      <div className="mock-panel absolute left-[34px] top-6 h-[378px] w-[300px] px-7 py-8 sm:left-[67px] sm:top-1 sm:h-[500px] sm:w-[355px] sm:px-10 sm:py-9">
        <p className="text-[11px] font-medium text-ink/45">Your Membership Tier</p>
        <p className="mt-1 text-2xl font-semibold text-brand-800">Premium</p>
        <p className="mt-7 text-[11px] font-semibold uppercase tracking-wide text-ink/45">
          Features
        </p>
        <ul className="mt-4 space-y-[14px] sm:space-y-[18px]">
          {membershipItems.map((item) => (
            <li key={item} className="flex items-start gap-3 text-[13px] font-medium text-ink/70 sm:gap-4 sm:text-sm">
              <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
                <Check size={10} strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="absolute bottom-[-4px] left-0 flex h-[64px] w-[min(330px,90vw)] items-center gap-3 rounded-full border border-[#f6f4ff] bg-white px-2 shadow-lift sm:bottom-[-21px] sm:h-[73px] sm:w-[352px]">
        <div className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ebedff] to-[#adb8ff] sm:size-[61px]">
          <img src={asset("paypal.svg")} alt="" className="h-7 w-6 object-contain" loading="lazy" />
        </div>
        <div>
          <p className="text-xs font-semibold text-brand-800">Upcoming Payment In...</p>
          <p className="text-[15px] font-medium text-ink sm:text-[17px]">14 Days - $79.99</p>
        </div>
      </div>
      <div className="absolute right-0 top-[126px] flex size-[72px] items-center justify-center rounded-full bg-gradient-to-br from-brand-300 to-brand-800 shadow-lift sm:top-[109px] sm:size-[91px]">
        <RrMark className="h-8 w-10 sm:h-10 sm:w-[50px]" />
      </div>
    </div>
  );
}
