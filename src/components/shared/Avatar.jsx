import React from "react";
import asset from "../../utils/assets";

export default function Avatar({ className = "" }) {
  return (
    <div className={`relative size-[53px] overflow-hidden rounded-full ${className}`}>
      <img
        src={asset("avatar-person-small.jpg")}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
        width="180"
        height="111"
      />
    </div>
  );
}
