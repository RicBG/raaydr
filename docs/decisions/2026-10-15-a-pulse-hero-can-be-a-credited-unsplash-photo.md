# A Pulse hero can be a hotlinked Unsplash photo, credited under the image

- **Date:** 15 October 2026
- **Decided by:** Ric, standing rule relayed by `claude-chat` on board row 3347 (every blog or Pulse page ships with a hero, from Unsplash or Higgsfield); built by `claude-deuce`
- **Related:** board rows 3263, 3347; `content/pulse/spotify-1000-stream-rule.md`, `lib/pulse.ts`, `app/pulse/[slug]/page.tsx`, `components/pulse/PostCard.tsx`; follows `2026-10-15-the-1000-stream-rule-post-goes-out-without-a-hero.md`
- **Status:** DECIDED
- **About:** the 1,000 stream rule post gets the Unsplash photo "Young music producer in home studio at night" by Rezli as its hero, loaded straight from images.unsplash.com with a "Photo by Rezli on Unsplash" line under it.

## The decision

A post's `heroImage` may be a full `https://` URL. When it is, `next/image` draws it `unoptimized`, so the browser fetches it from Unsplash rather than through our image proxy, and the share card and BlogPosting `image` use the URL as it is instead of prefixing `https://raaydr.com`. Two optional frontmatter fields, `heroCredit` and `heroCreditUrl`, render a credit under the hero: the photographer's name links to the photo page and "Unsplash" links to unsplash.com, both carrying `utm_source=raaydr&utm_medium=referral` as Unsplash asks.

The image is cropped to 2048 by 1152 by Unsplash's own imgix parameters (`fit=crop&w=2048&h=1152`), so it matches the 16:9 box every other hero reserves.

## Context

The post shipped without a hero (the earlier record). Ric then ruled that no page waits on him for one. `claude-chat` picked the photo through the Unsplash connector; the Unsplash licence is free and asks that images are hotlinked and the photographer credited.

## Options rejected

- **Copying the file into `public/pulse/images`** like our own artwork. Unsplash asks for hotlinking, and `claude-deuce`'s proxy cannot reach images.unsplash.com to download it anyway.
- **Serving it through the Next image optimiser** via `remotePatterns`. That would be Vercel fetching and re-serving the file, which is not a hotlink, and it costs image optimisation quota. Not needed once the image is drawn unoptimised.

## Evidence

- `lib/pulse.test.ts`: the post carries the hero, alt text and credit; a remote image is left on its own host in share metadata, our own images still get the site origin.

## What this does not decide

- **Higgsfield** heroes are not covered here; they would be files in `public/pulse/images` like the existing ones.
- Nobody on the builder side has seen the photo render: images.unsplash.com is refused by `claude-deuce`'s egress proxy, so the local browser check shows the layout and credit but not the picture itself.
