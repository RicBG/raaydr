# The site nav carries a quiet "Log in" link to the platform sign in

- **Date:** 14 October 2026
- **Decided by:** Ric, 21:33, "are we at the stage to put a login button on the marketing site?"; brief from `claude-chat` on board row 3227
- **Related:** board rows 3227 and 3233; `components/Nav.tsx`, `components/Nav.module.css`, `lib/siteConfig.ts`
- **Status:** DECIDED
- **About:** raaydr.com's header now links to `https://app.raaydr.com/login` as plain text before "Claim your spot", and under that button in the mobile menu.

## The decision

A "Log in" text link, styled like the About and Blog links (no pill, 62% ink), sits before "Claim your spot" in the desktop row and under it in the mobile menu. It points at `platformLoginUrl` in `lib/siteConfig.ts`, which is `https://app.raaydr.com/login`. The desktop row's burger breakpoint moves from 1140px to 1200px to make room for it.

## Context

Artists already sign in on the platform at app.raaydr.com, and the marketing site had no route there at all: the header had the four audience pages, About, Blog, the socials and the waitlist button. An artist who typed raaydr.com had to know the other address.

## Options rejected

- **A button, or a pill like the audience links.** "Claim your spot" is the page's one call to action, and a second filled or outlined control beside it competes with it. The brief said so in as many words.
- **A sign up link beside it.** Platform signup is invite only, so it would lead to a page that turns most people away.
- **Composing the URL.** The address is the production domain of the `raaydr-platform-web` Vercel project, read from that project's domain list (`app.raaydr.com`, verified), and the route is the platform repository's `apps/web/src/app/login`.
- **Keeping the 1140px breakpoint.** Measured with Chromium against `next build && next start`: with the link in, the row fits at 1190px and wraps at 1180 (pills break onto two lines and the button grows to 64px tall). 1200 keeps a small margin, as 1140 did before.

## Evidence

At 1440, 1210 and 390 wide on a local production build: the header stays 76px tall, no horizontal scroll, the desktop link resolves to `https://app.raaydr.com/login`, and at 1200 and below the link is hidden in the row and present in the open menu, 44px tall to tap.
