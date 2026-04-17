# GSAP UI Animation Playbook (EN)

## Purpose
This is a reusable playbook for building and maintaining timeline-based UI animations with GSAP.
Use it as a handover note for future projects, not only for one specific animation.
Keep it generic enough for future variants that may differ in staging, timing, and assets.

## Scope for Website Iframes
- These animations are meant to live inside iframes on the website.
- The animation itself should always fill the full available iframe width.
- Height should remain automatic from the artwork proportions inside the iframe.
- The wrapper page defines iframe size and aspect ratio.
- Keep the animation document self-contained: no page chrome, no extra spacing, no dependency on parent-page layout.
- Future animations may vary in structure, but the simple cursor and click feedback should be treated as the default reusable interaction language unless a project clearly needs something else.

## Core Pattern
- Build one master GSAP timeline that coordinates all moving parts.
- Keep visuals as separate layers (for example: background/stage, cursor/actor, click feedback).
- Drive movement with time-based keyframes (`at` + properties) and derive durations from adjacent keyframes.
- Keep loops deterministic: explicit start state, explicit reset state.

## Recommended Architecture
- One configuration block for timing constants.
- One sequence array for stage or scene swaps when the background changes over time.
- One keyframe array per animated actor.
- One event-time array for interaction triggers such as clicks, pulses, or highlights.
- One helper for applying immediate state (`gsap.set`).
- One helper for event-style feedback (for example click ripple/bump).
- One timeline assembly section where all `.to(...)` and `.call(...)` are registered.

## Layout Rules
- Use a single relative-positioned root container with width set to `100%`.
- The main stage asset should render at `width: 100%` and `height: auto`.
- Overlay actors should be positioned relative to that stage.
- Prefer percentage-based sizes and positions for overlays so motion scales with the artwork.
- Keep iframe backgrounds transparent unless the animation intentionally owns its background color.
- Because the animation fills the full viewport width and the wrapper page defines the actual iframe size, cursor and click indicator percentages must be calibrated relative to the stage artwork dimensions, not assumed to be the same across animations. Derive the correct percentage by comparing the desired visual size against the stage width.

## Timeline Design Principles
- Use absolute timeline times for synchronization points.
- Prefer one shared timing map as the single source of truth for the whole animation.
- Let stage swaps, actor keyframes, click events, fades, and loop boundaries all reference that same timing map.
- Use relative tween durations for smooth interpolation between states.
- Keep easing intentional:
  - positional travel: mostly linear/none unless a specific feel is needed
  - entrances/exits: subtle ease-in/out
  - interaction feedback: short and snappy ease
- Reserve tiny pauses deliberately; avoid accidental dead time.

## Keyframe Strategy
- Define keyframes as data objects, not hard-coded individual tweens.
- Treat scene or stage changes as data as well when they happen on a schedule.
- Suggested fields:
  - `at`
  - `left`, `top` (or `x`, `y`)
  - `autoAlpha`
  - `rotation`
  - optional `ease`
- Convert keyframes to tweens in a loop to keep maintenance simple.
- For non-positive gaps between keyframes, use immediate `timeline.call(...)`/`gsap.set(...)`.

## Sequence Model
- Separate long-lived visual concerns into distinct data sets.
- A common setup is:
  - one `times` object with named absolute positions in the timeline
  - one `stageSequence` array for artwork swaps or scene states
  - one `cursorKeyframes` array for cursor motion and visibility
  - one `eventTimes` array for click or emphasis moments
- Compute absolute `at` values once and let the timeline consume those values.
- Prefer deriving `stageSequence`, `cursorKeyframes`, and `eventTimes` from the shared `times` object instead of mixing raw intervals and fixed time points in different places.
- If a future animation needs a different structure, keep the same principle: animation data first, timeline wiring second.

## Timing Naming Strategy
- Keep timing names moderately semantic.
- Good names describe the animation beat or role, for example `cursorIntro`, `click1`, `stage5`, or `loopEnd`.
- Avoid names that are too generic to be useful, but also avoid locking timing names too tightly to one product story too early.
- Only move to deeper domain-specific naming once the animation concept is stable enough that those names will age well.

## Anchor and Coordinate Rules
- Always define one canonical anchor for interaction effects (cursor tip, center point, etc.).
- Keep `transform-origin` in CSS aligned with the cursor tip position in the asset.
- Define a matching `cursorAnchor` object with `x` and `y` as fractions (0–1) of the element's width/height.
- Compute the click indicator position from `offsetLeft + offsetWidth * cursorAnchor.x` and `offsetTop + offsetHeight * cursorAnchor.y`.
- The bump direction on click should push away from the tip, not toward it:
  - tip at top-left (0% 0%): bump nudges `x: +, y: +`
  - tip at top-right (100% 0%): bump nudges `x: -, y: +`
  - adjust for other anchor positions accordingly
- If the asset shape changes, retune only:
  - size
  - transform origin
  - anchor calculation

## Click Feedback Pattern
- A convincing click usually combines two layers:
  - actor bump (brief motion/scale change)
  - ripple/pulse indicator (expanding + fading)
- Run both from one trigger function so timing always stays in sync.
- Kill conflicting tweens before replaying interaction effects.

## Asset and Loading Practices
- Preload image assets used in timeline swaps.
- Preload the cursor asset too if it is swapped or faded in after load.
- Keep file naming predictable for sequenced frames.
- Avoid runtime stalls by preparing all visual states before first visible frame.

## Drop-in Overlay Pattern
- A drop-in overlay is a result image that fades and scales onto the stage to reveal the end state of an interaction.
- Layer it above the stage image with `position: absolute; inset: 0`.
- Start it hidden and oversized, for example `autoAlpha: 0, scale: 1.3`.
- Animate to `autoAlpha: 1, scale: 1` with a fast ease-out to give the impression of something snapping into place.
- Reset scale and opacity in the loop reset call alongside the stage image.
- Name the asset `drop-in-stage-N.svg` where N matches the stage it overlays.

## Accessibility and Semantics
- Keep meaningful stage imagery accessible with an appropriate `alt` when needed.
- Mark decorative animation layers such as cursor and click effects as hidden from assistive technology.
- Do not let purely decorative layers capture pointer events.

## Reset and Loop Safety
- At loop end, restore all baseline states explicitly.
- Reset temporary interaction artifacts (opacity/scale/offset props).
- Ensure first frame of next loop matches the expected initial visual state.

## Responsiveness and Robustness
- Size moving overlays proportionally when possible (percent-based width/position).
- Verify that the composition still works when the iframe becomes narrower while preserving full width.
- Re-test anchor accuracy after viewport changes and on mobile breakpoints.
- Keep interaction feedback subtle enough to avoid jitter on small screens.

## Tuning Workflow
- Change one variable class at a time:
  - path (positions)
  - timing (keyframe `at`)
  - feel (ease, bump strength, ripple size)
- When tuning timing, prefer adjusting named values in the shared timing map first.
- Validate by watching at normal speed and at reduced speed.
- Prioritize consistency over dramatic motion.

## Reuse Checklist
- Replace assets and update selectors.
- Confirm the iframe still fills full width and derives height from the stage artwork.
- Reconfirm anchor definition and transform origin.
- Reconfirm that click feedback is anchored to the intended cursor tip.
- Decide which parts are shared across language variants and which are locale-specific.
- Populate project-specific keyframes.
- Populate project-specific stage/scene sequence data if used.
- Set click/event timestamps or trigger conditions.
- Verify loop reset has no jumps.
- Verify all effects align with visible interaction points.

## Variant Management
- Keep animation mechanics shared across language variants whenever possible.
- Treat copy, embedded labels, and locale-specific artwork as replaceable assets, not as reasons to fork the animation logic too early.
- Name files and folders clearly by locale, for example `-en`, `-de`, while keeping the structure parallel between variants.
- If a locale version needs timing or layout adjustments, document only the delta in a small per-project note.

## New Animation Setup
- Create each new animation under `docs/site-2026/gsap/`.
- Use folder names with locale suffixes, for example `<animation-name>-en`.
- Add the `highlight-` prefix when the animation belongs to the highlight family, for example `highlight-media-center-en`.
- Not all animations need the `highlight-` prefix.
- Inside each new animation folder, create:
  - an empty `index.html`
  - an empty `assets/` folder for incoming files

## Maintenance Note
- This document should remain the baseline reference for future GSAP iframe animations in this repository.
- For now, keep each animation self-contained and observe patterns before extracting shared helpers or shared assets.
- Revisit shared functions and reusable asset conventions only after the animation pool is large enough to show stable repetition.
- Useful improvements are welcome, but ask for confirmation before making discretionary changes that go beyond the immediate project need.

## Optional Template Snippet
Use this shape as a starting point in new projects:

```js
const times = {
  stage1: 0.0,
  stage2: 1.0,
  stage3: 2.5,
  cursorIntro: 0.4,
  cursorFocus1: 0.8,
  cursorHold1: 1.6,
  cursorExit: 2.4,
  click1: 1.0,
  click2: 2.05,
  loopEnd: 3.0,
};

const stageSequence = [
  { at: times.stage1, src: "assets/stage-1.svg" },
  { at: times.stage2, src: "assets/stage-2.svg" },
  { at: times.stage3, src: "assets/stage-3.svg" },
];

const cursorKeyframes = [
  { at: times.cursorIntro, left: "20%", top: "20%", autoAlpha: 0, rotation: 20 },
  { at: times.cursorFocus1, left: "35%", top: "30%", autoAlpha: 1, rotation: 0, ease: "power1.out" },
  { at: times.cursorHold1, left: "50%", top: "45%", autoAlpha: 1, rotation: 8 },
  { at: times.cursorExit, left: "65%", top: "60%", autoAlpha: 0, rotation: -20, ease: "power1.in" },
];

const eventTimes = [times.click1, times.click2];
```

Keep this document generic and append project-specific numbers in a separate per-project note.
