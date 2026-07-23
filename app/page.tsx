import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import Algorithm from "@/components/sections/Algorithm";
import HowItWorks from "@/components/sections/HowItWorks";
import MidWave from "@/components/sections/MidWave";
import GradientSpan from "@/components/sections/GradientSpan";
import FindYourPlace from "@/components/sections/FindYourPlace";
import RealNumbers from "@/components/sections/RealNumbers";
import Stance from "@/components/sections/Stance";
import TickerMarquee from "@/components/TickerMarquee";
import FirstWave from "@/components/sections/FirstWave";
import ComparePill from "@/components/ComparePill";
import FaqAccordion from "@/components/FaqAccordion";
import { faqData } from "@/lib/faqData";

export default function Home() {
  return (
    <main>
      <Hero />
      <Problem />
      <HowItWorks />
      <MidWave />
      <GradientSpan>
        <Algorithm />
      </GradientSpan>
      <FindYourPlace />
      <RealNumbers />
      <Stance />
      <TickerMarquee
        top="Built for the culture"
        middle="Attention pays"
        bottom="Owned by the community"
      />
      <FirstWave />
      <FaqAccordion items={faqData.home} />
      <ComparePill />
    </main>
  );
}
