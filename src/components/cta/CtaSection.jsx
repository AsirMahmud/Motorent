import { ArrowRight } from "lucide-react";
import React from "react";
import asset from "../../utils/assets";

export default function CtaSection() {
  return (
    <section
      className="relative mt-12 h-auto overflow-hidden py-14 lg:h-[704px] lg:py-0 2xl:h-[870px]"
      style={{
        background:
          "radial-gradient(circle at -2% 9%, rgba(245, 252, 255, 0.92) 0 16%, rgba(245, 252, 255, 0) 16.2%), radial-gradient(circle at 94% 8%, rgba(255, 255, 255, 0.72) 0 13%, rgba(255, 255, 255, 0) 13.2%), linear-gradient(118deg, #5db4ee 0%, #5d94f0 43%, #8065ff 100%)",
      }}
    >
      <div className="pointer-events-none absolute left-[-205px] top-[-236px] hidden size-[540px] rounded-full bg-white/28 lg:block 2xl:left-[-185px] 2xl:top-[-250px] 2xl:size-[520px]" />
      <div className="pointer-events-none absolute left-[752px] top-[322px] hidden size-[430px] rounded-full bg-white/35 lg:block 2xl:left-[825px] 2xl:top-[490px] 2xl:size-[300px]" />
      <div className="pointer-events-none absolute right-[-182px] top-[-150px] hidden size-[470px] rounded-full bg-white/55 lg:block 2xl:right-[-120px] 2xl:top-[-170px] 2xl:size-[430px]" />
      <span className="pointer-events-none absolute left-[362px] top-[42px] hidden size-[74px] rounded-full bg-gradient-to-br from-[#ffed43] to-[#f29939] lg:block 2xl:left-[374px] 2xl:top-[45px] 2xl:size-[75px]" />
      <span className="pointer-events-none absolute bottom-[70px] left-[1115px] hidden size-[42px] rounded-full bg-gradient-to-br from-brand-300 to-brand-800 lg:block 2xl:bottom-[72px] 2xl:left-[1592px] 2xl:size-[43px]" />

      <div className="container-page relative z-10 grid items-center gap-12 lg:h-full lg:max-w-none lg:grid-cols-none lg:px-0">
        <div className="reveal relative mx-auto h-[330px] w-full max-w-[720px] overflow-hidden rounded-r-[34px] bg-white shadow-soft lg:absolute lg:left-0 lg:top-[118px] lg:h-[586px] lg:w-[720px] lg:max-w-none xl:w-[820px] 2xl:top-[144px] 2xl:h-[726px] 2xl:w-[980px]">
          <img
            src={asset("feature-dashboard-preview.jpg")}
            alt="RemoteRecruit app screen"
            className="h-full w-full object-cover object-left-top lg:h-full lg:w-full lg:rounded-r-[34px]"
            loading="lazy"
            width="960"
            height="1089"
          />
        </div>

        <div className="reveal relative mx-auto w-full max-w-[390px] text-left lg:absolute lg:left-[790px] lg:top-[154px] xl:left-[920px] 2xl:left-[1084px] 2xl:top-[211px] 2xl:max-w-[590px]">
          <p className="text-[15px] font-semibold tracking-[0.15px] text-brand-800 2xl:text-[25px] 2xl:leading-[35px]">
            Are you ready?
          </p>
          <h2 className="mt-4 text-[34px] font-medium leading-[44px] text-ink sm:text-[40px] sm:leading-[52px] 2xl:mt-[28px] 2xl:text-[64px] 2xl:leading-[80px]">
            Help is only a few clicks away!
          </h2>
          <p className="mt-[30px] max-w-[331px] text-[19px] leading-[35px] text-ink/60 2xl:mt-[34px] 2xl:max-w-[520px] 2xl:text-[28px] 2xl:leading-[48px]">
            Click Below to get set up super quickly and find help now!
          </p>
          <a
            href="#pricing"
            className="mt-[28px] inline-flex h-[61px] items-center gap-4 rounded-full bg-gradient-to-br from-brand-300/25 to-brand-800/10 pr-7 text-sm font-semibold text-brand-800 transition duration-300 hover:-translate-y-0.5 hover:shadow-lift focus:outline-none focus:ring-4 focus:ring-brand-300/25 2xl:mt-[30px] 2xl:h-[86px] 2xl:gap-5 2xl:pr-10 2xl:text-[24px]"
          >
            <span className="ml-0 flex size-[50px] items-center justify-center rounded-full bg-brand-300 text-white shadow-lift 2xl:size-[76px]">
              <ArrowRight className="size-[22px] 2xl:size-[38px]" />
            </span>
            Get Started
          </a>
        </div>
      </div>
    </section>
  );
}
