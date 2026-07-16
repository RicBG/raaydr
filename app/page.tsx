import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import Algorithm from "@/components/sections/Algorithm";
import HowItWorks from "@/components/sections/HowItWorks";
import GradientSpan from "@/components/sections/GradientSpan";
import FindYourPlace from "@/components/sections/FindYourPlace";
import RealNumbers from "@/components/sections/RealNumbers";
import Stance from "@/components/sections/Stance";
import FirstWave from "@/components/sections/FirstWave";
import ComparePill from "@/components/ComparePill";

export default function Home() {
  return (
    <main>
      <Hero />
      <Problem />
      <HowItWorks />
      <GradientSpan>
        <Algorithm />
      </GradientSpan>
      <FindYourPlace />
      <RealNumbers />
      <Stance />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/textures/waveform-divider.svg"
        alt=""
        aria-hidden="true"
        className="waveform-divider"
      />
      <FirstWave />
      <ComparePill />
    </main>
  );
}
