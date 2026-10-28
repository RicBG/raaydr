import { dayOnePlacesRemain } from "@/lib/platformSupabase";
import { readLlmsTemplate, renderLlmsTxt } from "@/lib/llmsTxt";

// Read per request, never cached: whether Day One places remain is a live fact, and an AI
// crawler quoting a stale "the first 100 listeners get ..." is the failure this route exists to
// remove. `dayOnePlacesRemain` fails closed, so an unreachable platform serves the closed wording.
export const dynamic = "force-dynamic";

export async function GET() {
  const open = await dayOnePlacesRemain();
  return new Response(renderLlmsTxt(readLlmsTemplate(), open), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
