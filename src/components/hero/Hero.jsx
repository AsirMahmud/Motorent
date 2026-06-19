import React from "react";

export default function Hero() {
  return (
    <section id="top" className="relative h-[640px] w-full overflow-hidden bg-white md:h-[48.889vw] md:max-h-[704px] md:min-h-[376px]">
      <div className="absolute inset-x-0 top-0 h-full w-full overflow-hidden">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1440 704"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="heroGrad0"
              x1="-666.432"
              y1="437.828"
              x2="-52.7159"
              y2="1589.72"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#52B4DA" />
              <stop offset="1" stopColor="#1E3E85" />
            </linearGradient>
            <linearGradient
              id="heroGrad1"
              x1="-644.712"
              y1="457.365"
              x2="-18.1383"
              y2="1596.48"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#1E3E85" />
              <stop offset="1" stopColor="#336DA6" />
            </linearGradient>
          </defs>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M1289.54 446.5C1324.03 446.5 1405.79 445.053 1439 446.5V0H0V700.621C42.0688 702.804 85.7979 704 131.121 704C651.054 704 840.511 446.5 1289.54 446.5Z"
            fill="url(#heroGrad0)"
          />
          <path
            d="M1440 0V652.537C1440 652.537 1262 519.631 1034 519.631C806 519.631 685.5 704 421.5 704C157.5 704 0 546.612 0 546.612V0H1440Z"
            fill="url(#heroGrad1)"
          />
          <mask
            id="heroMask0"
            style={{ maskType: "luminance" }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="1440"
            height="704"
          >
            <path
              d="M1440 0V652.537C1440 652.537 1262 519.631 1034 519.631C806 519.631 685.5 704 421.5 704C157.5 704 0 546.612 0 546.612V0H1440Z"
              fill="white"
            />
          </mask>
          <g mask="url(#heroMask0)">
            <circle opacity="0.05" cx="894" cy="634" r="262" fill="white" />
            <circle opacity="0.02" cx="256" cy="-105" r="262" fill="white" />
          </g>
        </svg>
      </div>
      <div className="container-page relative z-10 pt-[205px] text-center text-white md:pt-[17.4vw] xl:pt-[225px]">
        <div className="reveal mx-auto max-w-[1040px]">
          <h1 className="text-[34px] font-bold leading-[1.22] md:text-[32px] lg:text-[42px] xl:text-[53px] xl:leading-[68px]">
            RemoteRecruit's Difference
          </h1>
          <p className="mx-auto mt-4 max-w-[800px] text-[14px] font-medium leading-7 text-white/80 md:mt-3 md:max-w-[520px] md:text-[12px] md:leading-5 lg:max-w-[680px] lg:text-[16px] lg:leading-7 xl:max-w-[800px] xl:text-[20px] xl:leading-8">
            RemoteRecruit is connecting the world with an easy-to-use platform
            that lets full-time, part-time, and freelance workers showcase their
            talents to businesses that need them. With no paywalls, no fees, and
            no barriers, there's nothing but you, your talents, and the next step
            in your career.
          </p>
        </div>
      </div>
    </section>
  );
}
