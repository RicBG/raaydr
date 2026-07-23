import type { Metadata } from "next";
import AudiencePage from "@/components/AudiencePage";
import WhereYourMoneyGoes from "@/components/sections/WhereYourMoneyGoes";
import { faqData } from "@/lib/faqData";

export const metadata: Metadata = {
  title: "RAAYDR for Listeners: Your money follows your ears.",
  description:
    "Every month you pay for music. On RAAYDR, your money follows what you actually play, not what an algorithm pushed at you.",
};

export default function ForListenersPage() {
  return (
    <AudiencePage
      eyebrow="For Listeners"
      title="Your money follows your ears."
      lead="Every month you pay for music. On RAAYDR, your money follows what you actually play, not what an algorithm pushed at you. The artists you listen to are the artists you pay."
      color="#3BCE7B"
      halo="listeners"
      role="Listener"
      waitlistSource="listeners-page"
      faqItems={faqData.listeners}
      calculator={<WhereYourMoneyGoes />}
      points={[
        {
          title: "Every listen builds something.",
          body: "Listening earns you points with an artist. Not badges, not a leaderboard. A record of the fact you were actually there, held between you and them.",
        },
        {
          title: "Loyalty can unlock things.",
          body: "Artists can choose to open things up to the listeners who show up most. Some will, some won't, and that is theirs to decide. What is certain is that being early counts: the first 1,000 listeners, the Day Ones, lock £6.99 a month, forever.",
        },
      ]}
      heroCallout={{
        heading: "Your taste has power here.",
        body: "Every play, share, rating and save moves an artist forward. Not because an algorithm decided you'd like them, because you did. Tastemakers surface what's worth hearing first. The community decides if they were right. You're not bankrolling this from the sidelines. You're part of how the whole thing decides what's next.",
      }}
      tintSections={[
        {
          heading: "What loyalty gets you.",
          body: "Early access to new music. Discounts on merch and tickets. A shout-out from the artist themselves, when you've actually shown up. Every artist decides what unlocks and when, but showing up matters here in ways it never did on a platform that only counted your stream.",
        },
        {
          heading: "Your money, itemised.",
          body: "At the end of every month, we show you where your subscription went. Which artists. Which tastemakers. Actual amounts. Nobody else can show you this, because nobody else knows.",
        },
      ]}
    />
  );
}
