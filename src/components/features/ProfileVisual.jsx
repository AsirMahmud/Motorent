import { ArrowRight } from "lucide-react";
import React from "react";
import asset from "../../utils/assets";
import Avatar from "../shared/Avatar";
import CandidateCard from "./CandidateCard";

const profileTags = ["Python Dev", "Javascript", "Front End", "Back End", "iOS Development", "+12"];

export default function ProfileVisual() {
  return (
    <div className="relative mx-auto h-[420px] w-full max-w-[342px] sm:h-[454px] sm:max-w-[451px]">
      <span className="absolute left-3 top-0 size-[18px] rounded-full bg-gradient-to-br from-brand-300 to-brand-800 sm:left-7 sm:size-[22px]" />
      <div className="mock-panel absolute right-0 top-6 h-[382px] w-[310px] overflow-hidden p-4 sm:right-7 sm:top-1 sm:h-[451px] sm:w-[355px] sm:p-5">
        <div className="relative h-[176px] overflow-hidden rounded-2xl bg-[#f5f8ff]">
          <div className="absolute left-0 top-0 h-[72px] w-full bg-brand-800 px-5 py-4 text-white">
            <p className="text-[13px] font-semibold leading-4">102 Jobs Completed!</p>
            <p className="mt-1 text-[9px] font-medium text-white/60">
              Upload showcase + media
            </p>
          </div>
          <div className="absolute right-0 top-0 h-[72px] w-[150px] overflow-hidden">
            <img
              src={asset("feature-dashboard-preview.jpg")}
              alt=""
              className="h-full w-full object-cover object-right-top opacity-80"
              loading="lazy"
              width="960"
              height="1089"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#a78bfa]/50 to-[#52b4da]/20" />
          </div>
          <div className="absolute left-[37px] top-[57px] flex h-[45px] w-[185px] items-center gap-3 rounded-full bg-white px-2 shadow-lift">
            <Avatar className="size-[35px]" />
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold leading-3 text-brand-800">
                Dylan Smith
              </p>
              <p className="truncate text-[8px] font-medium leading-3 text-ink/45">
                Video Introduction
              </p>
            </div>
            <button
              className="ml-auto flex size-8 items-center justify-center rounded-full bg-brand-300 text-white"
              aria-label="Play profile video"
            >
              <ArrowRight size={15} />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[76px] bg-white px-5 pt-4">
            <div className="flex gap-5">
              <div className="h-[48px] flex-1 rounded-lg border border-[#edf2ff] bg-white p-2">
                <div className="mb-2 h-1.5 w-16 rounded-full bg-ink/10" />
                <div className="h-1.5 w-24 rounded-full bg-ink/10" />
              </div>
              <div className="h-[48px] flex-1 rounded-lg border border-[#edf2ff] bg-white p-2">
                <div className="mb-2 h-1.5 w-14 rounded-full bg-ink/10" />
                <div className="h-1.5 w-20 rounded-full bg-ink/10" />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-[110px] flex flex-wrap gap-3 sm:mt-[126px] sm:gap-4">
          {profileTags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-brand-800"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="absolute left-0 top-[156px] sm:top-[163px]">
        <CandidateCard
          role="Past Client Feedback"
          name="Best Developer Ever!"
          color="text-brand-800"
        />
      </div>
      <div className="absolute right-0 top-[118px] rounded-full border-4 border-brand-300 sm:top-[123px]">
        <Avatar className="size-[70px] sm:size-[83px]" />
      </div>
    </div>
  );
}
