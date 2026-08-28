/**
 * The markup behind BOOT_PREPAINT_SCRIPT: a full-bleed canvas-coloured panel
 * with the wordmark rising out of a soft spectrum glow, held over the page
 * until it has stopped moving.
 *
 * Server rendered, so it is in the HTML the browser paints first rather than
 * something hydration has to produce — the whole point is to be on screen
 * before React is. It stays `display: none` until the pre-paint script stamps
 * `data-booting` on <html>, which is what keeps it away from visitors with no
 * JavaScript, and returns to `display: none` for good when that script drops
 * the attribute again.
 *
 * The node itself outlives the curtain on purpose. It is React's, and on a
 * slow connection the script is finished with it well before hydration reaches
 * it; pulling it out from under React mismatched the tree. Left alone at
 * `display: none` it is out of layout, out of the paint, and out of the
 * accessibility tree, which is as gone as it needs to be.
 *
 * The wordmark is inlined rather than an <img>: at 1.4KB the request costs more
 * than the bytes, and a curtain whose one piece of content arrives over the
 * network is a curtain with a hole in it for the first hop. The glow is three
 * CSS gradients in the same spectrum tokens as the hero's orb stand-in, so this
 * reads as the hero resolving rather than as a separate loading screen.
 *
 * Decorative throughout: it covers content that is already in the document and
 * announced, and it names nothing a screen reader has not already reached.
 */
export default function BootScreen() {
  return (
    <div id="boot" className="boot" aria-hidden="true">
      <div className="bootInner">
        <div className="bootGlow" />
        <svg className="bootMark" viewBox="0 0 4743 838" role="presentation">
          <g transform="translate(67,750) scale(1,-1)">
            <path
              transform="translate(0,0)"
              d="M190 0H40V670H410Q534 670 601.5 617.5Q669 565 669 469Q669 301 480 283V275Q522 264 544.5 242.0Q567 220 588 180L685 0H511L419 174Q398 214 372.0 228.5Q346 243 289 243H190ZM190 535V356H409Q464 356 488.0 375.5Q512 395 512 446Q512 495 487.5 515.0Q463 535 409 535Z"
              fill="#15151A"
            />
            <path
              transform="translate(677,0)"
              d="M163 0H-5L288 670H502L797 0H625L562 148H227ZM348 429 285 283H504L441 429L400 533H389Z"
              fill="#15151A"
            />
            <path
              transform="translate(1454,0)"
              d="M163 0H-5L288 670H502L797 0H625L562 148H227ZM348 429 285 283H504L441 429L400 533H389Z"
              fill="#15151A"
            />
            <path
              transform="translate(2231,0)"
              d="M437 0H286V222L-11 670H174L302 474L358 384H369L425 474L553 670H739L437 221Z"
              fill="#15151A"
            />
            <path
              transform="translate(2944,0)"
              d="M371 0H48V670H371Q533 670 627.5 581.0Q722 492 722.0 335.0Q722 178 627.5 89.0Q533 0 371 0ZM371 535H198V135H371Q477 135 519.5 176.5Q562 218 562.0 335.0Q562 452 519.5 493.5Q477 535 371 535Z"
              fill="#15151A"
            />
            <path
              transform="translate(3676,0)"
              d="M190 0H40V670H410Q534 670 601.5 617.5Q669 565 669 469Q669 301 480 283V275Q522 264 544.5 242.0Q567 220 588 180L685 0H511L419 174Q398 214 372.0 228.5Q346 243 289 243H190ZM190 535V356H409Q464 356 488.0 375.5Q512 395 512 446Q512 495 487.5 515.0Q463 535 409 535Z"
              fill="#15151A"
            />
          </g>
          {/* The blip is part of the mark; never crop it. It is the one
              hardcoded brand hex the site cannot avoid: this SVG is inlined
              into the pre-paint curtain, which is on screen before any
              stylesheet has resolved a custom property.

              THIS IS A THIRD COPY OF THE SAME ARTEFACT. The other two are
              public/logo/raaydr-wordmark-blip-ink.svg and -light.svg, and all
              three must carry the same value. It is inlined here rather than
              fetched because a curtain whose one piece of content arrives over
              the network has a hole in it for the first hop; the cost of that
              is this duplication, so it is called out rather than left to be
              discovered.

              IT NO LONGER EQUALS --brand, AND THAT IS DELIBERATE. The value
              here is the platform's action violet, so the blip a visitor sees
              in the nav is the same violet as the mark they meet the moment
              they sign in. --brand is still the lighter violet and still
              carries the focus ring, the link underline and the ticker.
              Reconciling the two is a sitewide accent change with measured
              contrast consequences and is Ric's call, not this change's. */}
          <circle cx="4616" cy="690" r="60" fill="#7C4DFF" />
        </svg>
      </div>
    </div>
  );
}
