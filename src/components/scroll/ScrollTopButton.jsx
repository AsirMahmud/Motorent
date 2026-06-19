import { ArrowUp } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export default function ScrollTopButton() {
  const [visible, setVisible] = useState(false);
  const rafRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        setVisible(window.scrollY > 720);
        rafRef.current = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <button
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 z-40 flex size-12 items-center justify-center rounded-full bg-brand-800 text-white shadow-lift transition duration-300 hover:-translate-y-1 hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-300/30 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ArrowUp size={20} />
    </button>
  );
}
