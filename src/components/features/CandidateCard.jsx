import React from "react";
import Avatar from "../shared/Avatar";

export default function CandidateCard({ role, name, color = "text-brand-800" }) {
  return (
    <div className="flex h-[64px] w-[min(330px,90vw)] items-center gap-3 rounded-full border border-[#f6f4ff] bg-white px-2 shadow-lift sm:h-[73px] sm:w-[min(352px,92vw)]">
      <div className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ffed43] to-[#f29939] sm:size-[61px]">
        <Avatar />
      </div>
      <div className="min-w-0">
        <p className={`text-xs font-semibold leading-5 ${color}`}>{role}</p>
        <p className="truncate text-[15px] font-medium leading-6 text-ink sm:text-[17px]">
          {name}
        </p>
      </div>
    </div>
  );
}
