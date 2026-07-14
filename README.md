# RAAYDR — marketing site

Scroll-driven marketing site for RAAYDR, an independent music streaming
platform where your money follows the artists you actually listen to. Next.js (App
Router) + TypeScript, GSAP ScrollTrigger for all scroll choreography, Lenis
for smooth scrolling, CSS Modules with custom properties. No Tailwind, no
component libraries.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # vitest — calculator formula tests
npm run build      # production build
```

## Launch day: waitlist → live

One line in [lib/siteConfig.ts](lib/siteConfig.ts):

```ts
mode: "waitlist",   // flip to "live"
```

Every CTA label and the closing section's copy swap automatically. Pricing,
the artist split, and the calculator economics all live in the same object.

## Waitlist storage

The form posts to `POST /api/waitlist` (email + role, role required), which
inserts into a Supabase table. Set the env vars (see [.env.example](.env.example)):

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Table schema:

```sql
create table waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null,
  created_at timestamptz not null default now()
);
```

Duplicate emails are treated as success ("already on the list"). With no env
vars set, dev builds log signups to the server console; production returns 503.

## Silhouettes

Drop transparent PNGs into `public/silhouettes/` (side profile facing right,
~1600px tall). The pool is read from the folder at build time — adding a
seventh or tenth image is a zero code change; redeploy and it's in rotation.
Faces are shuffled once per page load and dealt out so no visitor sees the
same face twice in one visit. Until assets land, a soft ink placeholder
occupies the exact same box. The halo behind each is always rendered in code.

## The signal (core motif)

- **Ring** ([components/Ring.tsx](components/Ring.tsx)) — blurred conic
  gradient ring, one revolution ≈ 90s via rAF; scroll velocity accelerates the
  spin and breathes the scale 0.9–1.15. Hero + closing CTA.
- **Halo** — the same renderer in single colour mode; colour comes from the
  `--halo-color` CSS variable so GSAP can tween it between audiences (the
  signature transition of the silhouette section).
- **Pulse** ([components/Pulse.tsx](components/Pulse.tsx)) — radar sweep fired
  once per section entry; never on mobile, never under reduced motion.

## Reduced motion

Every scroll animation collapses to simple 0.3s fades via `gsap.matchMedia`:
no pinning, static ring, stacked silhouettes, calculator numbers set directly.

## Deploy

Built for Vercel. Set the two Supabase env vars in project settings. The OG
placeholder lives at `public/og.png`.
