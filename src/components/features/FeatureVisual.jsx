import React from "react";
import JobsVisual from "./JobsVisual";
import MembershipVisual from "./MembershipVisual";
import ProfileVisual from "./ProfileVisual";

export default function FeatureVisual({ type }) {
  if (type === "membership") return <MembershipVisual />;
  if (type === "profile") return <ProfileVisual />;
  return <JobsVisual />;
}
