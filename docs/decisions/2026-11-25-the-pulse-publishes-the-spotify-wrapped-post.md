# The Pulse publishes "Spotify Wrapped Shows Your Top Artist. Did Your Subscription Actually Pay Them?"

- **Date:** 25 November 2026
- **Decided by:** Ric approved the post and its copy in chat on 25 November ("ok lets do a late november one for today"); `claude-chat` (Riz) briefed it on board row 6688
- **Related:** `ops.handoff` row 6688; `content/pulse/spotify-wrapped-who-did-your-subscription-pay.md`
- **Status:** DECIDED
- **About:** a new Pulse post, live 25 November, with the repo's own rules applied to how the approved copy is stored.

## The decision

One new post at `/pulse/spotify-wrapped-who-did-your-subscription-pay`, newest on `/pulse`, in the sitemap, with the BlogPosting and FAQPage structured data every post carries. **The words are Ric's approved copy, unchanged.** What differs from the brief is how it is stored, because this repository's loader and rules decide what renders.

## What was mapped, and why each one is not a copy change

| brief | stored as | why |
| --- | --- | --- |
| `date`, `readTime: 5` | `datePublished`, `dateUpdated`, `readingTime: "5 min read"` | the loader's field names |
| `heroImage` at `/pulse/...jpg` | `/pulse/images/<slug>.jpg`, 2048 by 1152 | where every other local hero lives |
| `heroCredit: "Photo by Ben Blennerhassett on Unsplash"` | `Ben Blennerhassett` | the page draws "Photo by", "on Unsplash" and the link itself, so the full sentence would print twice |
| credit URL without tracking | the same URL with `utm_source=raaydr&utm_medium=referral` | Unsplash asks for it, and the other credited posts carry it |
| `heroAlt: "A man in a dark shirt lit by violet and blue light"` | `A person in headphones, seen in profile and lit in blue and magenta, looking down at a phone` | **the photo does not show that.** Unsplash's own auto description ("man in black shirt with blue light") is wrong, and alt text is for people who cannot see the picture, so it describes the picture |
| no `seoTitle` | `Spotify Wrapped: Who Did Your Subscription Pay?` | the loader requires one, and a test caps it so it fits with the brand suffix. **This is the only new wording in the change.** |
| `£12.99` typed in prose | `{{spotify.subscriptionPrice}}` | the repo's rule is that a money figure is read from the rates, never typed. It renders as £12.99 |
| FAQ as `###` headings | `**Question**` then the answer | the loader reads FAQ items in that shape only; `###` items would have left the FAQ and its structured data empty |
| "Keep reading" and the closing line after the FAQ | before the FAQ | everything after `## FAQ` is read as FAQ, so both would have been dropped from the page |
| bullet lists (Amy, Ben, Cal; Keep reading) | one paragraph each | the renderer has no lists: the first capture showed each list run together as one paragraph with literal hyphens |
| `[Sign up now](https://raaydr.com)` | the same link with `utm_source=pulse&utm_medium=blog&utm_campaign=<slug>&utm_content=body` | `AGENTS.md`: every link to raaydr.com carries UTMs. **The four `/pulse/...` links stay plain**, as the brief says |

`£155.88` is typed, because it is twelve payments of the price and there is no token for a year. A test asserts that twelve times the rate is £155.88, so a price change fails the build instead of leaving the post wrong.

## Options rejected

- **Hotlinking the Unsplash photo**, as five older posts do. The brief says to download it and save it; the download was recorded with Unsplash through the connector.
- **Adding list support to the Pulse renderer.** That changes every post's rendering and is not this change. Raised on the board.
- **Dropping `heroAlt` to the brief's wording.** It describes a man in a dark shirt and the image is of a person in headphones.

## What this does not decide

- **The table at 390** scrolls sideways inside its own wrapper (348px visible of 512), as the table in every other post does. The two worked columns are readable at 1440, but at 390 the third column needs a swipe. Left as the site's table component draws it.
- **Older posts with bullet lists** (`split-sheet-template`, the calculator and Apple Music posts) are likely to show the same run-together fault. Not checked on the live site and not touched.
- **`£9.99` in the "Where Your £9.99 Actually Goes on RAAYDR" link text** is typed, because it is that post's published title.
