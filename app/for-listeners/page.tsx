import type { Metadata } from "next";
import AudiencePage from "@/components/AudiencePage";

export const metadata: Metadata = {
  title: "RAAYDR for Listeners — Your money follows your ears.",
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
      points={[
        {
          title: "Every listen builds something.",
          body: "Listening earns you points with an artist. Not badges, not a leaderboard. A record of the fact you were actually there, held between you and them.",
        },
        {
          title: "Loyalty can unlock things.",
          body: "Artists can choose to open things up to the listeners who show up most. Some will, some won't, and that is theirs to decide. What is certain is that being early counts: the first 1,000 listeners lock £5.99 a month, forever.",
        },
      ]}
    />
  );
}
