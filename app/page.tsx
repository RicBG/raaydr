import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import Algorithm from "@/components/sections/Algorithm";
import HowItWorks from "@/components/sections/HowItWorks";
import PledgeTimeline from "@/components/sections/PledgeTimeline";
import MidWave from "@/components/sections/MidWave";
import GradientSpan from "@/components/sections/GradientSpan";
import FindYourPlace from "@/components/sections/FindYourPlace";
import RealNumbers from "@/components/sections/RealNumbers";
import Stance from "@/components/sections/Stance";
import TickerMarquee from "@/components/TickerMarquee";
import FirstWave from "@/components/sections/FirstWave";
import ComparePill from "@/components/ComparePill";
import SocietyLogoRow from "@/components/sections/SocietyLogoRow";
import WritersSocietySection from "@/components/sections/WritersSocietySection";
import { showSocietyLogos } from "@/lib/societies";
import FaqAccordion from "@/components/FaqAccordion";
import { faqData } from "@/lib/faqData";

export default function Home() {
  /* Read on the server, per request's build: off in production until Ric turns it on. See
     `lib/societies.ts`. */
  const showLogos = showSocietyLogos();
  return (
    <main>
      <Hero />
      {showLogos ? <SocietyLogoRow /> : null}
      <Problem />
      <HowItWorks />
      <PledgeTimeline />
      <TickerMarquee
        top="Be a day one"
        middle="Attention pays"
        bottom="Sign up now"
      />
      <MidWave />
      <GradientSpan>
        <Algorithm />
      </GradientSpan>
      {/* The calculator sits directly after "People are the algorithm": the
          section that explains attention is immediately followed by the one
          that prices it. The role cards, which ask the visitor to place
          themselves, come after. Swapping these two changes ScrollTrigger
          order, so both sections and Stance were re-checked for pinning and
          scroll progress. */}
      <RealNumbers />
      <WritersSocietySection showLogos={showLogos} />
      <FindYourPlace />
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
