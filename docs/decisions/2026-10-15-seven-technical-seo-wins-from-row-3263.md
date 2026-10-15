# Seven technical search fixes on raaydr.com, in their own commit

- **Date:** 15 October 2026
- **Decided by:** `claude-eve`, from the list on board row 3263; Ric's yes is still needed on the three pieces of brand copy (win 3)
- **Related:** board rows 3252, 3263; branch `eve/pages-2-5` (second commit); `lib/pulse.ts`, `app/pulse/[slug]/page.tsx`, `app/sitemap.ts`, `app/layout.tsx`, `app/tools/streaming-royalty-calculator/`
- **Status:** DECIDED (draft, nothing merged)

## The decision

1. **Pulse titles fit a results page.** An optional `seoTitle` frontmatter field, set on all 14 posts, and the suffix changes from ` · The Pulse · RAAYDR` to ` | RAAYDR`. Every title is now 60 characters or fewer; before, the longest was about 95 and Google cut them mid sentence. The on page H1 is unchanged. `lib/pulse.test.ts` fails a post with no `seoTitle` or one over 60.
2. **Internal links.** Six older posts gain a "Keep reading" paragraph that links to the per stream post, the calculator, the role pages and the new guides. Copy only. A test pins that the five money posts keep the link to the per stream post.
3. **Titles that carry a search term.** Home: "RAAYDR: Music Streaming That Pays the Artists You Play". `/artists`: "Get Paid by Real Fans: Streaming for Artists | RAAYDR". `/producers-songwriters`: "Royalty Splits for Producers and Songwriters | RAAYDR" (was about 90 characters). These are brand copy. **They are Ric's call**; the PR is a draft for that reason, and reverting is three one line edits.
4. **The calculator has its own page.** `/tools/streaming-royalty-calculator` renders the existing `Calculator` (the one on `/artists`) with a header, a four question FAQ with FAQPage schema, a reading list, and an entry in the sitemap. No new number is published. Per platform rates are not on this page: they live in the guide post and still need Ric's yes before they sit on a tool.
5. **Sitemap dates stop changing on every build.** Static routes used `new Date()`. They now use one fixed date. The checkout has no git history, so a true per page date was not available; the comment says to split it per route when there is a source.
6. **`<html lang="en-GB">`.** The WebSite schema already says `en-GB`.
7. **Search Console and Bing Webmaster Tools.** Registering the site is Ric's two minutes and cannot be done in code. What the code does: `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` environment variables, read in `app/layout.tsx`, emit the verification tags only when set. Ric (or Riz) pastes the token into Vercel, redeploys, then submits `/sitemap.xml`, which `robots.txt` already names.

## Context

All seven came from reading the live code on `6beb337` and PR #90 on 14 October. The site already had FAQPage schema, canonicals, `metadataBase`, per page Open Graph and a sitemap that lists every post, so none of that is touched.

## Options rejected

- **A Pulse title template in the layout.** Titles are long on purpose as H1s; a template would still cut them. A separate short field is the smaller change.
- **Hard coding the verification token.** Nobody has it yet, and a token in the repository is one more value to rot.

## What this does not decide

- Whether the three titles in win 3 are accepted.
- Whether the new page needs a nav or footer link; it is reachable from the posts and the sitemap, not from the main navigation.
- `vitest.config.ts` was added with a single `@` alias so the sitemap can be tested; no other test setting changed.
