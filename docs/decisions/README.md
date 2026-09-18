# Decision records

**This directory was started on 18 September 2026**, on `claude-chat`'s ruling (board row
1105), after a change to the waitlist form had nowhere to put its reasoning. It is a copy
of the same file in `RicBG/raaydr-platform`, and the two are meant to stay the same: the
two repositories are one product, and a rule about how decisions are recorded that holds
in one of them holds in neither.

The code shows what was built. Almost nothing shows why, and why is the part that gets
lost. This directory is where it goes.

## Who these are for

Someone who has never spoken to either agent and was not in the room when the decision
was made. Not Ric, who was there. Not the agent who wrote the code, who will not be.

That means: name the thing before using its short name, say what was tried and rejected,
and quote the evidence rather than referring to it. If a record only makes sense to
someone who already knows the answer, it has not been written yet.

## When to write one

**No pull request merges without its decision record.** If a change only moves code
around, the record is three lines. If it changes what the platform does to a person, or
closes off an option somebody will otherwise reopen in six months, it is longer.

The record and the `ops.handoff` note reporting the work are **the same markdown, written
once.** See `CLAUDE.md`.

## Naming

`YYYY-MM-DD-short-slug.md`, dated the day the decision was made rather than the day it
was written up.

## Template

```markdown
# Title, as a statement of what was decided

- **Date:** the day it was decided
- **Decided by:** who actually made the call
- **Related:** PR, issue, migration, commit
- **Status:** DECIDED, or SUPERSEDED BY <record>

## The decision

One paragraph. What is now true that was not true before.

## Context

What was happening that made this need deciding. Include the thing that went wrong, if
something did, with dates and figures.

## Options rejected

Each one, and why it lost. This is the section that stops the decision being reopened
from scratch, so a rejected option with no reason attached is worse than no entry.

## Evidence

What was actually checked, and how. Log lines, row counts, test names, timestamps. Where
something could not be verified, say so and say why.

## What this does not decide

The edges. What is still open, and what would change the answer.
```

## Records

| Date | Record | About |
| --- | --- | --- |
| 2026-08-24 | [r2-gate-split](2026-08-24-r2-gate-split.md) | A missing images bucket stopped audio playing. One gate became two. |
| 2026-08-26 | [password-minimum-drift](2026-08-26-password-minimum-drift.md) | A constant mirrored a dashboard setting and drifted. An artist could not sign up. |
| 2026-08-26 | [signup-error-classifier](2026-08-26-signup-error-classifier.md) | Why the invite wording is confined to one branch, and everything else is neutral. |
| 2026-08-26 | [auth-config-drift-check](2026-08-26-auth-config-drift-check.md) | Watching production's auth settings with a public credential, on a schedule. |
| 2026-08-26 | [handoff-noticeboard](2026-08-26-handoff-noticeboard.md) | Why the two agents talk through a table in the production database. |
| 2026-08-26 | [play-events-partition-grants](2026-08-26-play-events-partition-grants.md) | Partitions locked down, and why a privilege read is not an exposure. |
| 2026-08-26 | [admin-listening-is-inert](2026-08-26-admin-listening-is-inert.md) | An admin accrues nothing, by design rather than by an accident of role ordering. |
| 2026-08-26 | [player-shows-the-time](2026-08-26-player-shows-the-time.md) | The seconds are what artists are paid on, so the player shows them at every width. |
| 2026-08-26 | [player-clock-legibility](2026-08-26-player-clock-legibility.md) | The clock was there and unreadable. A band of its own, and a colour meant to be read. |
| 2026-08-26 | [tile-grid-equal-columns](2026-08-26-tile-grid-equal-columns.md) | One long title made one column wide and the other narrow. `1fr` is not zero. |
| 2026-08-26 | [two-player-states](2026-08-26-two-player-states.md) | The mini bar stops doing the expanded player's job, because now there is one. |
| 2026-08-27 | [tiles-lose-their-play-button](2026-08-27-tiles-lose-their-play-button.md) | Six violet circles competing with the one that matters. The playing record takes a ring. |
| 2026-08-27 | [links-stop-underlining-themselves](2026-08-27-links-stop-underlining-themselves.md) | A descendant cannot cancel an ancestor's underline, so two correct-looking rules did nothing. |
| 2026-08-27 | [preview-link-with-every-pull-request](2026-08-27-preview-link-with-every-pull-request.md) | Ric reviews on a phone. A PR number is not something he can look at; a branch alias is. |
| 2026-08-27 | [player-v2-actions-row](2026-08-27-player-v2-actions-row.md) | The artwork was pushing the play button off a small phone. Two of the three new actions have no table to write to. |
| 2026-08-27 | [where-a-listener-lands](2026-08-27-where-a-listener-lands.md) | A listener was signing in and arriving at the artist dashboard. They land on the player now. |
| 2026-08-27 | [the-account-picture](2026-08-27-the-account-picture.md) | Listeners get a picture. It is not the artist avatar, and the sweeper had to be told before it deleted them. |
| 2026-08-27 | [choose-from-already-uploaded](2026-08-27-choose-from-already-uploaded.md) | A single can go on an EP without being uploaded twice. Two songs already exist twice on production because it could not. |
| 2026-08-27 | [a-track-under-every-release-it-is-on](2026-08-27-a-track-under-every-release-it-is-on.md) | The catalogue reader fans out over memberships. A record that does not list a song it contains is wrong about itself. |
| 2026-08-27 | [merging-the-duplicate-tracks](2026-08-27-merging-the-duplicate-tracks.md) | Two songs exist twice. Written, not applied. It also caught the sweeper being one column short of deleting an EP's cover. |
| 2026-08-27 | [an-artist-page-before-the-first-upload](2026-08-27-an-artist-page-before-the-first-upload.md) | An artist with no tracks was shown no social links, because they sat inside the play button's condition. |
| 2026-08-27 | [the-release-the-upload-flow-forgot](2026-08-27-the-release-the-upload-flow-forgot.md) | A missing useCallback dependency detached every EP and album track from the release the artist had just made. |
| 2026-08-27 | [the-label-owns-column-one](2026-08-27-the-label-owns-column-one.md) | Help text was 150px wide beside a 982px input on 15 of 36 form rows. Invisible on a phone. Now a rule and a check. |
| 2026-08-27 | [two-dates](2026-08-27-two-dates.md) | release_date decides whether a track plays. Artists were typing 2020 into it. A second, inert date, on both tables, inheriting from neither. |
| 2026-08-27 | [the-phantom-job](2026-08-27-the-phantom-job.md) | An empty queue returned a row of nulls, which PostgREST sends as an object. Idle workers looped on id=eq.null for five days. |
| 2026-08-27 | [a-finished-step-stays-on-the-page](2026-08-27-a-finished-step-stays-on-the-page.md) | Finishing a step used to delete it. Now it stays, marked Complete. Tags out of the flow, and the counter was never wrong. |
| 2026-08-27 | [the-upload-that-deleted-itself](2026-08-27-the-upload-that-deleted-itself.md) | Every server call succeeded, the R2 PUT did not, and the cleanup removed the evidence. Three reports, one cause. |
| 2026-08-27 | [the-at-sign-was-never-there](2026-08-27-the-at-sign-was-never-there.md) | Next passes the route segment as `%40wrnr`. The guard tested it before decoding, so every artist page 404ed at its own address. |
| 2026-08-27 | [the-width-is-a-key-not-a-size](2026-08-27-the-width-is-a-key-not-a-size.md) | Six call sites asked for image widths nobody ever rendered. 424 and 496 were a layout size doubled for retina. |
| 2026-08-27 | [the-release-nobody-came-back-to](2026-08-27-the-release-nobody-came-back-to.md) | Two empty releases, both an abandoned attempt retried minutes later. Adopted rather than swept. And a record now gets a cover. |
| 2026-08-27 | [the-day-one-tape](2026-08-27-the-day-one-tape.md) | The approved render is the backdrop, the label is drawn live. Its own counter, its own caps. Blocked on four images this agent cannot reach. |
| 2026-08-28 | [the-upload-flow-in-six-steps](2026-08-28-the-upload-flow-in-six-steps.md) | Built as four, rebuilt as six on Ric's review. Back on every step, the declaration follows the file, and the explicit box starts writing. |
| 2026-08-28 | [publish-is-a-button-that-publishes](2026-08-28-publish-is-a-button-that-publishes.md) | The review step's Publish was a link to the catalogue. Two named actions, an exact confirmation, and confetti only when something published. |
| 2026-08-28 | [a-role-nobody-can-find-has-not-been-surfaced](2026-08-28-a-role-nobody-can-find-has-not-been-surfaced.md) | `featured_artist` existed all along, third in a dropdown. Its own section, no features cap, and the public display raised rather than built. |
| 2026-08-28 | [a-catalogue-is-ordered-by-when-the-music-came-out](2026-08-28-a-catalogue-is-ordered-by-when-the-music-came-out.md) | A 2019 mixtape sorted above last month's single because it was uploaded second. One coalesced sort key, and the year printed matches the year sorted on. |
| 2026-08-28 | [the-state-existed-and-he-could-not-see-it](2026-08-28-the-state-existed-and-he-could-not-see-it.md) | Progress moves below the Upload button, tags leave the release editor, the transcoder reads `release_tracks`, and the artist-page link is withdrawn. |
| 2026-08-28 | [a-feature-is-shown-without-opening-the-money-table](2026-08-28-a-feature-is-shown-without-opening-the-money-table.md) | Credits live in `splits`, next to invite emails and share values. One function returning one column, gated on the track being published. |
| 2026-08-28 | [the-shop-window-is-one-thing-and-the-database-checks-whose-it-is](2026-08-28-the-shop-window-is-one-thing-and-the-database-checks-whose-it-is.md) | One pin, two nullable FKs. RLS proves the profile row is yours and says nothing about what the columns point at, so a trigger does. |
| 2026-08-28 | [the-banner-holds-one-kind-because-only-one-kind-has-data](2026-08-28-the-banner-holds-one-kind-because-only-one-kind-has-data.md) | The fixed hero becomes v4's cycling region. Three of its four kinds have no table, the Day One tape included, so they are absent rather than stubbed. |
| 2026-08-28 | [three-capabilities-that-existed-and-could-not-be-seen](2026-08-28-three-capabilities-that-existed-and-could-not-be-seen.md) | A song title was the only door to the track editor. Every control looks like a control, applied to four places, plus the mark on the crossing tab. |
| 2026-08-28 | [the-credits-become-public-and-the-features-only-reader-goes](2026-08-28-the-credits-become-public-and-the-features-only-reader-goes.md) | Produced by, written by, mixed by, on a published track. One reader replaces the features-only one, because two definer functions on the money table is one to forget. |
| 2026-09-01 | [the-picker-had-no-stylesheet](2026-09-01-the-picker-had-no-stylesheet.md) | The mood picker had no CSS. A chosen chip looked like an unchosen one and only the blocked ones looked different, which an artist read as pre-ticking. |
| 2026-09-01 | [the-words-are-part-of-the-song](2026-09-01-the-words-are-part-of-the-song.md) | Lyrics on the track, one id-keyed reader for the page and the player, and the rights declaration goes to v2 to cover them. |
| 2026-09-01 | [the-moods-go-on-one-row](2026-09-01-the-moods-go-on-one-row.md) | Discover showed four of fifteen mood tiles on a phone. One swipe row, all fifteen, and the truncation goes. |
| 2026-09-01 | [the-guard-did-not-know-where-the-styles-were](2026-09-01-the-guard-did-not-know-where-the-styles-were.md) | The class guard read three of seven stylesheets and produced a false finding that travelled. It reads the list out of layout.tsx now. |
| 2026-09-01 | [a-song-can-be-in-five-moods](2026-09-01-a-song-can-be-in-five-moods.md) | The third tap greyed 80% of the vocabulary. The cap on derived moods goes from three to five. One constant, no migration. |
| 2026-09-01 | [the-transfer-stops-being-a-place-you-wait](2026-09-01-the-transfer-stops-being-a-place-you-wait.md) | Ten tracks took forty-one minutes of a person watching a bar. Two transfers at once, and the artist describes the next while they go. |
| 2026-09-01 | [declaration-first-then-several-at-once](2026-09-01-declaration-first-then-several-at-once.md) | Ric tested bulk upload on a preview that cannot upload. The declaration moves first and gates both pickers; several files go straight to the queue and are named on their rows. |
| 2026-09-02 | [one-way-to-add-audio](2026-09-02-one-way-to-add-audio.md) | Ric used both pickers and the several-at-once one was better for one file too. One picker, always; a single caps at the classifier's three; Back left, Next right. |
| 2026-09-02 | [one-or-many](2026-09-02-one-or-many.md) | Every step that touches tracks is the list of tracks, each row opening to its own form; one track is the form alone. Credits per track, the review accordion, the cap held by the server. |
| 2026-09-02 | [the-name-is-a-field-everywhere-it-shows](2026-09-02-the-name-is-a-field-everywhere-it-shows.md) | The credits step can rename the track, and the audio step says out loud that the names are editable. If we only know because we built it, it is not obvious. |
| 2026-09-02 | [the-finesse-pass](2026-09-02-the-finesse-pass.md) | The review facts run full width, the accordion rows look like controls, the cards ease in, finished steps and tracks take a brand wash and read Complete, and the button loses its comma. |
| 2026-09-02 | [a-way-back-on-the-listening-side](2026-09-02-a-way-back-on-the-listening-side.md) | Moods, a mood, Genres and a genre each carry a named way back one level up, drawn as a control. The genre row shows two rows of four on desktop with Browse more. |
| 2026-09-02 | [a-draft-release-can-be-deleted](2026-09-02-a-draft-release-can-be-deleted.md) | A last card on the release page deletes the record and the tracks only on it, with a red button. A published track anywhere on it refuses the delete; unpublish first. |
| 2026-09-02 | [an-invite-that-was-sent-says-so](2026-09-02-an-invite-that-was-sent-says-so.md) | The panel mints a code per pasted address and emails it with their name on it, the row records the send, and each invited artist carries a funnel from joined to published. A send that did not happen is never recorded as one. |
| 2026-09-02 | [the-email-is-violet-and-signs-off-with-the-socials](2026-09-02-the-email-is-violet-and-signs-off-with-the-socials.md) | Every email button is violet, not the listener green. The signup address gets space and a stop. Three monochrome social line icons in the footer, each labelled so a blocked image is still a working link. |
| 2026-09-02 | [the-invites-screen-is-a-tool-not-a-page](2026-09-02-the-invites-screen-is-a-tool-not-a-page.md) | The list is the resting state and the send panel collapses behind one control. Progress is two lines of prose with only what is missing in colour, cards are titled with a person, and the code sits behind a tap. |
| 2026-09-03 | [a-platform-that-can-speak-to-its-artists](2026-09-03-a-platform-that-can-speak-to-its-artists.md) | Notifications written only by triggers and definers, one thread per person with RAAYDR on the other side, a bell in the chrome and not a sixth tab, and an admin composer that sends to five people as five messages, each emailed and each able to reply. |
| 2026-09-03 | [the-column-was-never-being-divided](2026-09-03-the-column-was-never-being-divided.md) | Screens looked narrow because `.stack` shrank every child to its content, so a responsive grid had no width to divide. The default is inverted, three lists state their columns intrinsically, and a test fails any container that has not chosen. |
| 2026-09-03 | [a-bell-that-points-at-nothing](2026-09-03-a-bell-that-points-at-nothing.md) | A reply rang the bell but wrote no row, so the count pointed at an empty list under a sentence explaining why. Replies write rows, the bell counts only rows, and reading a conversation clears them. |
| 2026-09-03 | [the-delete-had-no-door](2026-09-03-the-delete-had-no-door.md) | An artist reported records he thought he had deleted. The delete worked; the catalogue is built from tracks, so a record with none never appeared and could not be opened. |
| 2026-09-03 | [an-ipad-is-a-big-phone](2026-09-03-an-ipad-is-a-big-phone.md) | The listening side's desktop threshold moves 901 to 1024, so an iPad gets the phone's layout. A shortened rail plus a tab bar is two navigations arguing. Genre tiles stay at Ric's four. |
| 2026-09-03 | [the-database-tests-are-run](2026-09-03-the-database-tests-are-run.md) | Four database test files that nothing ran. Two could not pass, neither for a fault. A replay script builds a Postgres, replays 77 migrations and runs them all. |
| 2026-09-03 | [the-bar-is-three-groups](2026-09-03-the-bar-is-three-groups-and-the-phone-is-named-areas.md) | The desktop bar becomes v5's three groups. The phone's order stops depending on the order of the JSX, after three regressions that did. |
| 2026-09-03 | [the-panel-shows-what-there-is](2026-09-03-the-panel-shows-what-there-is.md) | The bar's reserved right group is filled: the words and the queue, at 1024 and up. No lyric highlight, because nothing produces a timestamp per line. |
| 2026-09-03 | [three-of-the-six-discover-sections-have-no-data](2026-09-03-three-of-the-six-discover-sections-have-no-data.md) | Stage 3 is six sections. Three are built, two have no table, and the radar's most-hearted track has one heart. |
| 2026-09-03 | [the-tape-gets-its-own-counter](2026-09-03-the-tape-gets-its-own-counter.md) | One sequence per role, the DAY ONE label stopping at the cohort cap. Written, not applied. Listener issuing refused by a raise, which protects a thousand slots. |
| 2026-09-03 | [the-heart-goes-back-on-the-phone-bar](2026-09-03-the-heart-goes-back-on-the-phone-bar.md) | Ric asked for it back and confirmed knowing what it reversed. The 29 August bug was a full-width anchor, not a small button, so the heart cannot span. |
| 2026-09-03 | [one-card-for-the-three-things-about-a-record](2026-09-03-one-card-for-the-three-things-about-a-record.md) | Lyrics, up next and credits become one frosted card on a phone. Credits leaves the actions row, which goes from four columns to three. |
| 2026-09-03 | [back-is-on-every-screen-that-needs-one](2026-09-03-back-is-on-every-screen-that-needs-one.md) | Four screens gained a way out. The test reads the navigation to know which screens need one, rather than keeping a list that drifts. |
| 2026-09-03 | [the-tape-goes-on-library-and-brings-a-bug-with-it](2026-09-03-the-tape-goes-on-library-and-brings-a-bug-with-it.md) | The tape sits at the top of Library and renders for nobody, because nobody holds one. Drawing it found the label taking a theme token, which would have printed white type on cream paper. |
| 2026-09-03 | [the-tape-is-issued-at-signup-and-unlocked-by-the-profile](2026-09-03-the-tape-is-issued-at-signup-and-unlocked-by-the-profile.md) | A number at signup keeps your place; the object is earned by completing the profile, and a locked one is shadowed rather than hidden. Applying it found my_tape undefined for anyone holding two tapes. |
| 2026-09-04 | [signup-failures-become-visible](2026-09-04-signup-failures-become-visible.md) | Signup was shut for 12 hours and nothing noticed. An hourly check keyed on the error text, not the code, because a bad invite code also returns a 500. Replayed on the real day: one alert, zero noise, 52 minutes. |
| 2026-09-04 | [the-hand-on-the-tape](2026-09-04-the-hand-on-the-tape.md) | Reenie Beanie replaces Marck Script and the serial is etched. Two thirds of the brief was backwards: the new hand has double the x-height and is a fifth narrower, so it needed to shrink, not grow. |
| 2026-09-04 | [the-tape-comes-off-its-backdrop](2026-09-04-the-tape-comes-off-its-backdrop.md) | The four renders carried a studio backdrop baked into the PNG. Cut out to the cassette, 1264x848 becomes 924x604, and the label is positioned off measured landmarks. |
| 2026-09-04 | [ci-runs-the-checks](2026-09-04-ci-runs-the-checks.md) | Nothing ran `verify.sh` except a person remembering to. One workflow, no dependency caching, because caching was slower every way it was measured. |
| 2026-09-04 | [the-alert-window-stops-trusting-the-schedule](2026-09-04-the-alert-window-stops-trusting-the-schedule.md) | This repository's cron arrives about five hours late. Each run asks when the previous one started and reads back to there. |
| 2026-09-04 | [the-page-stops-guessing-and-the-alert-comes-back](2026-09-04-the-page-stops-guessing-and-the-alert-comes-back.md) | The signup error told artists to check a code that was fine, and the `setup-node` bump that fixed one workflow had killed two others. |
| 2026-09-04 | [the-alert-was-blind-and-green](2026-09-04-the-alert-was-blind-and-green.md) | The alert's first working run reported a quiet window with two failures in it. A response with no `result` array is no longer read as an empty one. |
| 2026-09-04 | [only-one-request-shape-may-clear-signup](2026-09-04-only-one-request-shape-may-clear-signup.md) | Two more explanations died, so the endpoint is instrumented rather than guessed at. Only the trusted shape may report signup healthy; the other may alarm and never clear. |
| 2026-09-04 | [count-what-the-playhead-moved](2026-09-04-count-what-the-playhead-moved.md) | Listening time was the clock's, not the playhead's, so a stalled player still accrued. Clamped to forward progress, which is what artists are paid on. |
| 2026-09-04 | [the-third-column-at-1280](2026-09-04-the-third-column-at-1280.md) | The scale table promised three columns at 1280 and the stylesheet never contained the number. The right rail gets built, keeping Ric's 252px left rail rather than v5's 168px. |
| 2026-09-04 | [the-heart-the-cards-and-the-grain](2026-09-04-the-heart-the-cards-and-the-grain.md) | The heart was drawn as a play button, record cards were 58% over their own cap because every check read the floor rather than the card, and the grain was present and invisible. |
| 2026-09-04 | [the-attention-wave-waits-for-listeners](2026-09-04-the-attention-wave-waits-for-listeners.md) | Measured before building: 49 counted events, and no track has been listened to five times. A curve drawn from four sessions is a claim about an audience that does not exist. |
| 2026-09-04 | [the-rail-was-hidden-by-the-rule-below-it](2026-09-04-the-rail-was-hidden-by-the-rule-below-it.md) | The third column shipped empty: the rule hiding the rail sat below the one showing it. 901 tests green, because every one read the container rather than the contents. |
| 2026-09-04 | [the-signature-comes-back-on-the-listening-side](2026-09-04-the-signature-comes-back-on-the-listening-side.md) | The banner's dash was a 16px border, and the whole area had the brand `//` switched off by Ric's own 29 July ruling. Reversed here, kept on Backstage. |
| 2026-09-04 | [a-real-waveform-comes-out-of-the-transcoder](2026-09-04-a-real-waveform-comes-out-of-the-transcoder.md) | ffmpeg already decodes every file twice for loudness, so peaks ride that pass rather than a browser download of the whole track. Decided, not built. |
| 2026-09-04 | [the-long-bar-owns-transport](2026-09-04-the-long-bar-owns-transport.md) | The right rail shipped with a second play button 200px from the first. The clocks disagreeing was never two states: all three surfaces read one field. |
| 2026-09-04 | [the-bar-gets-volume-and-a-playlist](2026-09-04-the-bar-gets-volume-and-a-playlist.md) | The right group's reserved third slot is filled. Mute is not a volume of zero, and the guard that counted two controls is replaced by the property it stood for. |
| 2026-09-04 | [the-transport-moves-left-of-the-waveform](2026-09-04-the-transport-moves-left-of-the-waveform.md) | Ric's Melo long bar contradicted his own 3 September centring ruling, so the conflict was put to him in one line. Four groups, transport left of the scrub, phone untouched. |
| 2026-09-04 | [the-waveform-was-always-there](2026-09-04-the-waveform-was-always-there.md) | Real peaks have existed for all 114 tracks since 22 August. Two agents designed a column, a transcoder change and a backfill for data already in the table. Reading the schema is not reading the data. |
| 2026-09-04 | [the-rail-gets-a-fixed-head-and-one-scrolling-body](2026-09-04-the-rail-gets-a-fixed-head-and-one-scrolling-body.md) | Ric's blank space was the scroll container, not a missing block. Filling it would have hidden the fault at one length and not another. |
| 2026-09-04 | [what-you-have-given-is-your-own-listening](2026-09-04-what-you-have-given-is-your-own-listening.md) | RLS on listening_days matches the artist too, so a sum over it adds listening TO an artist into their own total. Right for everybody except the people reviewing the platform. |
| 2026-09-04 | [pick-up-where-you-left-off](2026-09-04-pick-up-where-you-left-off.md) | The rail reads a playhead that has been stored since 24 August, and the borders it drew in an invisible colour. |
| 2026-09-04 | [new-on-raaydr-lists-records](2026-09-04-new-on-raaydr-lists-records.md) | One ten-track record would have been the whole block. The fold is the feature, and it needs no new SQL. |
| 2026-09-04 | [the-marquee-gets-its-line](2026-09-04-the-marquee-gets-its-line.md) | The pinned module is named, gets the artist's own sentence, and loses an empty state that denied a capability the platform had. |
| 2026-09-04 | [ask-them-carries-a-number](2026-09-04-ask-them-carries-a-number.md) | The first thing carrying anything from a listener to an artist. It carries a count, and there is nowhere to type. |
| 2026-09-04 | [the-alert-stops-going-green-when-it-cannot-see](2026-09-04-the-alert-stops-going-green-when-it-cannot-see.md) | Two runs read no log lines and both showed as passes. Three tries, then red, and the warning branch is gone. |
| 2026-09-04 | [favourite-artists-waits-to-be-a-ranking](2026-09-04-favourite-artists-waits-to-be-a-ranking.md) | A ranked list of one is not a ranking. And The Master needed no code: for listeners it is blocked on Stripe, not copy. |
| 2026-09-04 | [the-window-frame](2026-09-04-the-window-frame.md) | The last piece of the desktop reference. Its width could not be copied, and one declaration replaced the plan to rewrite the player. |
| 2026-09-04 | [the-attention-wave](2026-09-04-the-attention-wave.md) | All three envelopes. 373 seek events turned out to be 35 gestures: a drag is one intention, not twenty. |
| 2026-09-06 | [the-wave-is-filled-areas](2026-09-06-the-wave-is-filled-areas.md) | The reference never drew bars anywhere. And the reduction took the max of each window, so the louder the master the flatter it drew. |
| 2026-09-06 | [the-bars-were-holding-the-box-open](2026-09-06-the-bars-were-holding-the-box-open.md) | Three faults in one screenshot, two of them one cause: the box collapsed to zero, so the drawing spilled over the times and there was nothing left to scrub. |
| 2026-09-06 | [the-app-is-the-screen-again](2026-09-06-the-app-is-the-screen-again.md) | Ric reversed his own window frame ruling. `contain: paint` had been re-parenting seven fixed boxes, and the guard is inverted rather than deleted. |
| 2026-09-06 | [the-banners-breakpoint-was-901-all-along](2026-09-06-the-banners-breakpoint-was-901-all-along.md) | The docblock said 901 and the code said 1024, so a band 123px wide served the wide artwork into the phone's stacked slot. |
| 2026-09-06 | [the-lyrics-trigger-becomes-a-quote-bubble](2026-09-06-the-lyrics-trigger-becomes-a-quote-bubble.md) | One icon, not three. The override is written into the reference file, because a commit message is not where the next reader looks. |
| 2026-09-06 | [the-genre-page-becomes-screen-06](2026-09-06-the-genre-page-becomes-screen-06.md) | Ric ruled the ranking chip in. The fourth definer written for the same RLS policy, and the page docblock was a stale build instruction. |
| 2026-09-06 | [backstage-counts-every-play](2026-09-06-backstage-counts-every-play.md) | Every artist dashboard read zero, including one with 919 seconds against his records. A play is five seconds, and the caption says how much of it can earn. |
| 2026-09-10 | [two-migrations-reached-production-with-no-file](2026-09-10-two-migrations-reached-production-with-no-file.md) | The environment holding the checkout had never held a GitHub credential, so two applies had no file and the branch died with the container. Recovered from `schema_migrations`. |
| 2026-09-10 | [a-live-profile-cannot-exist-without-a-handle](2026-09-10-a-live-profile-cannot-exist-without-a-handle.md) | 21 published tracks returned nothing everywhere for a day and no error was reported anywhere. Deferred triggers, because signup holds the two apart mid transaction. |
| 2026-09-10 | [search-returns-artists-not-only-their-songs](2026-09-10-search-returns-artists-not-only-their-songs.md) | Search matched artist names from day one and drew a track card for every hit, so an artist was never reachable from a search. Four files, not a feature. |
| 2026-09-10 | [the-tape-bar-is-readable-line-by-line](2026-09-10-the-tape-bar-is-readable-line-by-line.md) | A checklist needed the bar line by line, and a second copy of it would have shown five ticks above a locked tape. tape_unlocked is now the AND of the five. |
| 2026-09-10 | [discover-stops-printing-the-status-enum](2026-09-10-discover-stops-printing-the-status-enum.md) | "Just published" was the name of a column value. Renaming it collided with the right rail, which is the fault a rename makes when nobody checks every place the old string appeared. |
| 2026-09-11 | [a-card-is-a-record-so-a-track-on-two-records-gets-two](2026-09-11-a-card-is-a-record-so-a-track-on-two-records-gets-two.md) | A song pulled onto a second record vanished from its own single, and 4x7 had been a two-track EP for three weeks. The rule that broke had a comment predicting it. |
| 2026-09-11 | [the-record-cover-goes-to-the-record](2026-09-11-the-record-cover-goes-to-the-record.md) | A cover was chosen, accepted, and silently never sent, because the record was built from a pulled track and nothing carried it. The endpoint that fixes it had existed for weeks. |
| 2026-09-11 | [the-picker-offers-more-than-we-accept](2026-09-11-the-picker-offers-more-than-we-accept.md) | Pressing "Record cover" did nothing and production logged no call at all, because an iPhone's HEIC was refused by the operating system's picker where there is no message and no event. |
| 2026-09-11 | [a-play-remembers-the-record-it-came-from](2026-09-11-a-play-remembers-the-record-it-came-from.md) | Album listening and single listening were indistinguishable. The record goes on the session rather than on every event, and the context is derived from it so the two cannot disagree. |
| 2026-09-11 | [the-completeness-surface-is-a-checklist-not-a-score](2026-09-11-the-completeness-surface-is-a-checklist-not-a-score.md) | The ring and its percentage are gone. One definition of the bar lives in the database, so five ticks above a locked tape is not a reachable state. |
| 2026-09-14 | [artists-apply-and-ric-approves](2026-09-14-artists-apply-and-ric-approves.md) | Artists apply and Ric approves. Why the form calls the database directly, and what that costs. |
| 2026-09-17 | [a-place-promised-is-a-place-gone](2026-09-17-a-place-promised-is-a-place-gone.md) | The RAAYDR+ offer stops itself when the places run out, counting codes that are out and still redeemable rather than numbers already taken. |
