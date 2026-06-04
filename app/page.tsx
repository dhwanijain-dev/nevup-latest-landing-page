import type { Metadata } from "next";
import LandingPage from "./components/LandingPage";
import LaunchingSoon from "./components/LaunchingSoon";

export const metadata: Metadata = {
  title: "NevUp : Built for clear decisions in noisy markets.",
  description:
    "A behavioral intelligence layer for high-noise modern markets. Designed for the generation that won't accept a trading environment built against them.",
    icons: {
    icon: "/favicon.ico",
  },
};

export default function Home() {
  return <LandingPage />;
  // return <LaunchingSoon/>;

}