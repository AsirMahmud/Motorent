import { Menu, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import asset from "../../utils/assets";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition duration-300 ${
        scrolled || open ? "bg-brand-800/95 shadow-lift backdrop-blur" : "bg-transparent"
      }`}
    >
      <nav className="container-page flex h-[92px] items-center justify-between md:h-[74px] xl:h-[92px]">
        <a href="#top" aria-label="RemoteRecruit home">
          <img
            src={asset("logo-remote-recruit.svg")}
            alt="RemoteRecruit"
            className="h-[53px] w-[132px] object-contain md:h-[34px] md:w-[86px] xl:h-[53px] xl:w-[150px]"
            loading="eager"
          />
        </a>

        <div className="hidden items-center gap-6 text-[10px] font-semibold text-white md:flex xl:gap-8 xl:text-xs">
          <a href="#signin" className="opacity-90 transition hover:opacity-100">
            Sign In
          </a>
          <a
            href="#pricing"
            className="rounded-full bg-brand-300 px-4 py-2.5 text-white transition hover:-translate-y-0.5 hover:bg-[#65c5e8] xl:px-5 xl:py-3"
          >
            Sign Up
          </a>
        </div>

        <button
          className="inline-flex size-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur md:hidden"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="mx-6 rounded-2xl bg-white p-4 shadow-soft md:hidden">
          <a
            href="#signin"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-4 py-3 text-sm font-semibold text-ink hover:bg-brand-50"
          >
            Sign In
          </a>
          <a
            href="#pricing"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-4 py-3 text-sm font-semibold text-ink hover:bg-brand-50"
          >
            Sign Up
          </a>
        </div>
      )}
    </header>
  );
}
