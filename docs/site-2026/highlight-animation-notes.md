# GSAP UI Animation Playbook (EN)

## Purpose
This is a reusable playbook for building and maintaining timeline-based UI animations with GSAP.
Use it as a handover note for future projects, not only for one specific animation.

## Core Pattern
- Build one master GSAP timeline that coordinates all moving parts.
- Keep visuals as separate layers (for example: background/stage, cursor/actor, click feedback).
- Drive movement with time-based keyframes (`at` + properties) and derive durations from adjacent keyframes.
- Keep loops deterministic: explicit start state, explicit reset state.

## Recommended Architecture
- One configuration block for timing constants.
- One keyframe array per animated actor.
- One helper for applying immediate state (`gsap.set`).
- One helper for event-style feedback (for example click ripple/bump).
- One timeline assembly section where all `.to(...)` and `.call(...)` are registered.

## Timeline Design Principles
- Use absolute timeline times for synchronization points.
- Use relative tween durations for smooth interpolation between states.
- Keep easing intentional:
  - positional travel: mostly linear/none unless a specific feel is needed
  - entrances/exits: subtle ease-in/out
  - interaction feedback: short and snappy ease
- Reserve tiny pauses deliberately; avoid accidental dead time.

## Keyframe Strategy
- Define keyframes as data objects, not hard-coded individual tweens.
- Suggested fields:
  - `at`
  - `left`, `top` (or `x`, `y`)
  - `autoAlpha`
  - `rotation`
  - optional `ease`
- Convert keyframes to tweens in a loop to keep maintenance simple.
- For non-positive gaps between keyframes, use immediate `timeline.call(...)`/`gsap.set(...)`.

## Anchor and Coordinate Rules
- Always define one canonical anchor for interaction effects (cursor tip, center point, etc.).
- Keep transform origin aligned with that anchor.
- Compute effect coordinates from runtime element geometry (for example `offsetLeft/offsetTop/offsetWidth/offsetHeight`).
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
- Keep file naming predictable for sequenced frames.
- Avoid runtime stalls by preparing all visual states before first visible frame.

## Reset and Loop Safety
- At loop end, restore all baseline states explicitly.
- Reset temporary interaction artifacts (opacity/scale/offset props).
- Ensure first frame of next loop matches the expected initial visual state.

## Responsiveness and Robustness
- Size moving overlays proportionally when possible (percent-based width/position).
- Re-test anchor accuracy after viewport changes and on mobile breakpoints.
- Keep interaction feedback subtle enough to avoid jitter on small screens.

## Tuning Workflow
- Change one variable class at a time:
  - path (positions)
  - timing (keyframe `at`)
  - feel (ease, bump strength, ripple size)
- Validate by watching at normal speed and at reduced speed.
- Prioritize consistency over dramatic motion.

## Reuse Checklist
- Replace assets and update selectors.
- Reconfirm anchor definition and transform origin.
- Populate project-specific keyframes.
- Set click/event timestamps or trigger conditions.
- Verify loop reset has no jumps.
- Verify all effects align with visible interaction points.

## Optional Template Snippet
Use this shape as a starting point in new projects:

```js
const keyframes = [
  { at: 0.0, left: "20%", top: "20%", autoAlpha: 0, rotation: 20 },
  { at: 0.8, left: "35%", top: "30%", autoAlpha: 1, rotation: 0, ease: "power1.out" },
  { at: 1.6, left: "50%", top: "45%", autoAlpha: 1, rotation: 8 },
  { at: 2.4, left: "65%", top: "60%", autoAlpha: 0, rotation: -20, ease: "power1.in" },
];
```

Keep this document generic and append project-specific numbers in a separate per-project note.
