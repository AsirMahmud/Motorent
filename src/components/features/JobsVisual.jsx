import React from "react";
import asset from "../../utils/assets";
import RrMark from "../shared/RrMark";
import CandidateCard from "./CandidateCard";

export default function JobsVisual() {
  return (
    <div className="relative mx-auto h-[392px] w-full max-w-[342px] sm:h-[454px] sm:max-w-[451px]">
      <span className="absolute left-3 top-0 size-[18px] rounded-full bg-gradient-to-br from-brand-300 to-brand-800 sm:left-7 sm:size-[22px]" />
      <div className="mock-panel absolute right-0 top-6 h-[318px] w-[300px] overflow-hidden p-3 sm:right-7 sm:top-1 sm:h-[451px] sm:w-[355px] sm:p-5">
        <img
          src={asset("feature-dashboard-preview.jpg")}
          alt="RemoteRecruit dashboard preview"
          className="h-[136px] w-full rounded-2xl object-cover object-left-top sm:h-[176px]"
          loading="lazy"
          width="960"
          height="1089"
        />
      </div>
      <CandidateCard
        role="Python Developer"
        name="Felonious Gru"
        className=""
      />
      <div className="absolute left-0 top-[211px] sm:top-[235px]">
        <CandidateCard role="Python Developer" name="Felonious Gru" />
      </div>
      <div className="absolute left-3 top-[302px] sm:left-[86px] sm:top-[344px]">
        <CandidateCard
          role="Front End Wizard"
          name="Mel Muselphiem"
          color="text-brand-300"
        />
      </div>
      <div className="absolute right-0 top-[150px] flex size-[72px] items-center justify-center rounded-full bg-gradient-to-br from-brand-300 to-brand-800 shadow-lift sm:top-[153px] sm:size-[91px]">
        <RrMark className="h-8 w-10 sm:h-10 sm:w-[50px]" />
      </div>
    </div>
  );
}
