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
- The simple cursor and click feedback pattern is a common default interaction language, but both are optional.
- Animations may focus on layered overlays, progressive reveals, or other effects without interaction feedback.

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
- One shared script per animation (for example `highlight-assistants/shared.js`) loaded by both locale pages.
- Thin locale entry pages (`highlight-*-en/index.html`, `highlight-*-de/index.html`) that mostly define structure and script includes.

## Layout Rules
- Use a single relative-positioned root container with width set to `100%`.
- The main stage asset should render at `width: 100%` and `height: auto`.
- Overlay actors should be positioned relative to that stage.
- Prefer percentage-based sizes and positions for overlays so motion scales with the artwork.
- Keep iframe backgrounds transparent unless the animation intentionally owns its background color.

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
- Apply the same rule to every animated layer, including overlays (for example drop-in layers), not only cursors or user actors.
- Suggested fields:
  - `at`
  - `left`, `top` (or `x`, `y`)
  - `autoAlpha`
  - `rotation`
  - optional `ease`
- Convert keyframes to tweens in a loop to keep maintenance simple.
- If a layer is mostly static, keep a keyframe array anyway and read index `0` for initial/reset state so the project keeps one consistent mental model.
- For non-positive gaps between keyframes, use immediate `timeline.call(...)`/`gsap.set(...)`.

## Sequence Model
- Separate long-lived visual concerns into distinct data sets.
- A common setup is:
  - one `times` object with named absolute positions in the timeline
  - one `stageSequence` array for artwork swaps or scene states
  - one `overlayKeyframes` array per overlay layer that animates (drop-in, emphasis cards, badges, etc.)
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
- Keep transform origin aligned with that anchor.
- Compute effect coordinates from runtime element geometry (for example `offsetLeft/offsetTop/offsetWidth/offsetHeight`).
- For the standard cursor pattern, treat the click point as the cursor tip rather than the visual center of the cursor asset.
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

**Standard indicator style (established in highlight-assistants-en):**
- Shape: solid filled circle, `background-color: #141414`, `border-radius: 50%`
- No border, no background-color variation per actor — one shared neutral dark style
- Centering: use CSS `transform: translate(-50%, -50%)` so the indicator is always centered on the cursor tip without needing GSAP `xPercent/yPercent`
- Tween: `gsap.set(el, { left, top, scale: 0.4, autoAlpha: 1 })` → `gsap.to(el, { duration: 0.35, scale: 1.4, autoAlpha: 0, ease: "power1.out" })`

**Sizing:**
- Base reference: `3.2%` of stage width at 624px (highlight-assistants-en)
- Scale to other animations by: `3.2% × (referenceStageWidth / thisStageWidth)`
- Example: for a 758px-wide stage: `3.2% × (624 / 758) = 2.64%`

**Anchor calculation:**
- `anchorX/anchorY` are fractions of the user wrapper's width/height, pointing to the cursor tip
- Leo (tip top-left of wrapper): `anchorX: 0, anchorY: 0`
- Zoe (tip top-right, cursor at `left: 45.4%`, `width: 39.5%`): `anchorX: 0.849, anchorY: 0`
- General formula for right-side cursors: `anchorX = cursorLeft% + cursorWidth%` (as a fraction)
- The bump direction is derived automatically: `anchorX < 0.5` → bump right + tilt CCW; otherwise bump left + tilt CW

**Rotation-safe click feedback (important):**
- If cursor rotation is keyframed in the main timeline, do not kill or reset `rotation` inside click feedback helpers.
- Prefer `gsap.killTweensOf(userElement, "x,y,scale")` instead of killing all props or including rotation.
- Keep click micro-motion scoped to `x/y/scale` so timeline-driven `rotation` values continue uninterrupted.
- If click feedback must touch rotation, capture the current rotation first and restore it explicitly after the tap tween.

## Timing Offset Workflow
When stakeholders ask for "the same animation, just 0.5s later" (or similar), apply a systematic offset rather than changing scattered tweens.

- Keep one `times` object as the single source of truth.
- Shift named markers in that object, not individual timeline tween start times.
- If only post-intro beats should move, leave `stage1` fixed and offset all later markers.
- Keep relative gaps between key moments unchanged unless intentionally retiming behavior.
- After shifting times, verify `loopEnd` still leaves enough room for fade-out and reset.

## Asset and Loading Practices
- Preload image assets used in timeline swaps.
- Preload the cursor asset too if it is swapped or faded in after load.
- Keep file naming predictable for sequenced frames.
- Avoid runtime stalls by preparing all visual states before first visible frame.

### Bitmap Optimization Workflow (SVG + Raster)
- When SVGs contain embedded bitmap payloads (for example `data:image/...` or nested `<image href=...>`), externalize those bitmaps into separate files when possible.
- Figma exports often include alpha channels by default, even when transparency is not visually needed.
- Treat alpha as ambiguous by default: if alpha is detected, ask for confirmation before flattening/removing alpha or converting to JPG.
- If no transparency is required, prefer JPG for photo-like bitmap content to reduce payload.
- Keep PNG only when true transparency is required.

### Local Preview Requirement
- Do not rely on `file://` URLs for final verification when SVGs reference external bitmap files.
- Browsers can block or inconsistently load nested local-file image references in that mode.
- Validate with a local HTTP server instead, for example:

```bash
cd /path/to/repo
python3 -m http.server 8000
```

- Then open the animation via `http://localhost:8000/...`.

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

### Locale Folder Strategy (Current Setup)
- Keep one folder per locale per animation, for example `highlight-agency-en` and `highlight-agency-de`.
- Keep language-specific files inside each animation-local `assets/` directory.
- Keep reusable neutral files in `docs/site-2026/gsap/assets/shared/` (for example cursors and neutral user elements).
- Include `../asset-resolver.js` from each animation `index.html` so shared fallback logic is available.
- Keep animation logic in one shared file per animation, for example `docs/site-2026/gsap/highlight-assistants/shared.js`, then include it from both locale `index.html` files.

### Current Shared-Script Layout
- Per-animation shared logic lives in:
  - `docs/site-2026/gsap/highlight-agency/shared.js`
  - `docs/site-2026/gsap/highlight-assistants/shared.js`
  - `docs/site-2026/gsap/highlight-collaboration/shared.js`
  - `docs/site-2026/gsap/highlight-images/shared.js`
  - `docs/site-2026/gsap/highlight-media-center/shared.js`
  - `docs/site-2026/gsap/highlight-page-management/shared.js`
- Locale pages should avoid large inline timeline blocks.
- Update animation behavior in the shared script first; only add locale-specific timing/position deltas when strictly required.

### Update Workflow (No-Drift Rule)
- For behavior/timing fixes: edit only the relevant `highlight-<name>/shared.js` file.
- For language-specific visual content: update only `highlight-<name>-de/assets/` or `highlight-<name>-en/assets/`.
- For neutral actors/cursors/labels: store once in `docs/site-2026/gsap/assets/shared/`.
- Keep `index.html` changes minimal and structural (script includes, mount node, locale bootstrap).

### Asset Resolution Priority
- Resolve assets in this order:
  1. local animation assets (`./assets/<file>`)
  2. shared neutral assets (`../assets/shared/<file>`)
- This allows locale-specific overrides without duplicating neutral assets in every locale folder.

### Practical Import Flow for New Locale Assets
- Create locale-specific exports into the matching `highlight-*-de/assets/` folder.
- Move truly neutral files to `docs/site-2026/gsap/assets/shared/` only when they are stable and reused by multiple animations.
- Keep filenames stable between locales so no timeline code changes are needed.
- If German text length shifts geometry, tune only the keyframe delta values for that locale.

## Maintenance Note
- This document should remain the baseline reference for future GSAP iframe animations in this repository.
- Keep one canonical animation timeline per animation in its shared script and reuse it across locales.
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

## Drop-In Overlay Pattern (Progressive Reveals)
When building animations that layer multiple overlays on top of a persistent stage (for example, progressive comment reveals, feature highlights, or step-by-step content):

**Structure:**
- Keep the main stage visible throughout (e.g., `autoAlpha: 1` from start to fade-out).
- Layer overlay elements absolutely on top, each starting at opacity 0 and scale greater than 1 (e.g., 1.18–1.3).
- Animate each overlay: fade in + scale down to 1 over 0.3–0.5 seconds using `power2.out` easing.
- Control stacking order with z-index to ensure overlays appear in the correct visual order.

**Transform Origin Handling:**
- For most overlays that appear in the upper-left or center area: use `transform-origin: 50% 50%` (center).
- For overlays in corners (e.g., bottom-right emoji reaction): use `transform-origin: 100% 100%` (bottom-right) so the element scales outward from that corner and remains visible during the scale-up phase.

**Timing:**
- Use the shared `times` object to coordinate overlay reveal moments.
- Example: first comment appears at 0.8s, settles by 1.1s; second comment line appears at 1.1s, settles by 1.45s.
- Keep the timing map explicit so future reveals can be inserted without trial and error.

**Pop-up Variant (Single Emphasis Overlay):**
- Start with very small scale (0.5–0.75) and low opacity.
- Animate to 1.2–1.3 scale with `power2.out` easing (0.3s duration).
- Then settle to 1.0 scale with `power2.out` easing (0.15s duration).
- Useful for special reactions (emoji) or final emphasis moments.
- Use appropriate transform-origin to control where the pop-up emanates from.

**Fade-Out Synchronization:**
- At loop end, fade out all overlays together with the stage to keep the visual cohesion.
- Use a shared `fadeOutAt` constant calculated once: `Math.max(times.loopEnd - stageFadeOutDuration, stageFadeInDuration)`.
- Apply fade-out to the entire array of overlays in one timeline tween.

**Optional Comment Typing Effect:**
- To simulate typing or progressive text reveal without JavaScript string manipulation, use multiple overlay layers with partial text.
- Example: `-1` shows first comment plain card, `-1a` shows the first line, `-1b` shows both lines.
- Each layer fades in and scales at its own time, creating a text-appearing effect.
- This approach is robust and asset-driven, avoiding dynamic text generation complexity.

## Composite User Actor Pattern
When an actor has a cursor that rotates or scales independently from its name label, split them into two child layers inside one wrapper div instead of combining them in a single SVG.

**Structure:**
```html
<div id="user-leo" class="user-actor">
  <img id="leo-cursor" class="user-layer" src="../assets/shared/user-leo-cursor.svg" />
  <img id="leo-label"  class="user-layer" src="../assets/shared/user-leo-label.svg"  />
</div>
```
- The wrapper (`user-actor`) is `position: absolute` with a `%`-based width and an explicit `aspect-ratio` matching the combined bounding box of both layers.
- Both children are `position: absolute` inside the wrapper, sized and positioned with `%` values relative to the wrapper.
- Move, fade, and position the wrapper via GSAP. Rotate/scale the cursor child independently. Never rotate the label child.

**Transform origins:**
- Set the cursor's `transform-origin` to the visual tip of the cursor (e.g. `30% 100%` for a left-leaning cursor, `70% 100%` for a right-leaning one).
- The label child has no transform-origin concern — it is never transformed.

**Click anchor:**
- Pass `anchorX`/`anchorY` fractions relative to the wrapper into `triggerUserClick()`.
- The click indicator position is computed at runtime from the wrapper's `offsetLeft/offsetTop/offsetWidth/offsetHeight` so it scales automatically with the iframe width.

## Sizing Rule: Use the Displayed CSS Width as Percentage Base
When calculating `%`-based widths for overlay elements, always use the **displayed CSS width** of the stage asset, not its internal viewBox or artwork coordinate space.

- SVG files often have an internal coordinate system (e.g. 1290 px wide in the viewBox) that is larger than their rendered size (e.g. `width="758"`).
- The iframe and all overlays scale with the CSS width (758 in this example), so that is the correct divisor.
- Formula: `overlayWidth / stageDisplayedWidth` → e.g. `314 / 758 = 41.42%`
- Double-check: open the SVG file and read its `width` attribute (not the viewBox dimensions).
- If you use the viewBox size as the divisor, overlays will appear too small.

## Drag Gesture Pattern
To convey a user dragging an object across the canvas and dropping it:

**Structure:**
- Add an absolutely positioned `<img class="dragged-image">` layer for the item being dragged.
- Give it the correct `aspect-ratio` matching the actual asset pixel dimensions (not `1/1`).
- Size it with a `%` width calculated against the stage displayed width.

**Choreography:**
1. Fade the dragged image in at the same moment the actor appears (`leoIntro`).
2. Move both the actor wrapper and the dragged image independently toward a shared "drop" destination over the same duration — they travel together visually but remain separate elements.
3. On the click beat, instantly hide the dragged image with `timeline.set(draggedImage, { autoAlpha: 0 })`.
4. Trigger the stage swap (src change) at the same beat so the new stage already shows the item in its "placed" state — this sells the drop illusion without needing a drop animation.

**Reset:**
- In the loop-end reset, restore the dragged image to its start position and `autoAlpha: 0` so it is ready for the next loop.

## Pre-Commit Optimization Checklist
Use this checklist before committing animation asset updates:

1. **Scan SVGs for raster payloads**
- Check for `data:image/...` and nested `<image href=...>` references.
- Externalize embedded bitmap data where practical.

2. **Validate alpha-channel intent**
- If alpha is present, treat it as ambiguous (especially from Figma exports).
- Confirm whether transparency is truly required before flattening or switching formats.

3. **Pick raster format intentionally**
- Keep PNG when true transparency is needed.
- Prefer JPG for non-transparent, photo-like bitmap content.

4. **Rewrite and verify references**
- Update all related references after file-format changes (`.png` -> `.jpg`, etc.).
- Confirm there are no stale references in SVG/HTML/JS/CSS.

5. **Measure and preview correctly**
- Capture before/after file-size totals (overall and per animation family when useful).
- Validate visuals through a local HTTP server (`http://localhost:...`), not `file://`.
