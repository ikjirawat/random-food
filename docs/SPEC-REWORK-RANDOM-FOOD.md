# SPEC — Random Food Opus 4.8 Polish

**Task**: TASK-REWORK-RANDOM-FOOD
**Author**: Supra (Tech Lead + System Architect)
**Date**: 2026-05-29
**Branch**: `task/TASK-REWORK-RANDOM-FOOD` (from `master`)
**Owner**: Flufee (frontend) — **Bake NOT required** (see §0)
**Type**: Polish — NO new features, NO new food items

---

## 0. Scope & Backend Decision

Random Food is a **frontend-only** app. All food data lives in `src/data/foods.json` (91 items),
validated at load by Zod (`src/schemas/food.ts`), with no API, no DB, no server. History is
`localStorage`-only (`src/hooks/useHistory.ts`). Geolocation is browser-native.

**→ No backend work exists. Bake is NOT dispatched. This is a Flufee-only task.**

Polish targets, in priority order:
- **P0** — Functional glitches & clean lint (0 errors / 0 warnings)
- **P1** — Accessibility (reduced-motion, ARIA, modal, contrast) + content consistency
- **P2** — Optional niceties (only if time permits, zero-risk)

**Hard constraints**
- `npm run build` (`tsc -b && vite build`) must stay green.
- `npm run lint` must end at **0 problems** (currently 3 errors + 2 warnings — all addressed below).
- Do NOT add/remove/edit any item in `foods.json`. Do NOT add npm dependencies.
- Preserve the muted dark aesthetic (น้อยแต่มาก). Contrast fixes are surgical, not a redesign.

---

## Design Intent

1. **User emotion**: decisive relief — "I don't have to think, just tap." The polish must remove
   every micro-stutter that breaks that flow.
2. **Visual anchor**: *calm*. The dark surface stays calm; motion is purposeful, never restless.
3. **Palette hint**: keep the existing warm orange `#FF6B35` accent on `#0F0F14`. No new colors;
   only nudge a few text opacities up for legibility.
4. **Interaction level**: rich (framer-motion already pervasive) — but motion must yield to
   `prefers-reduced-motion`.

---

## P0 — Functional Glitches & Clean Lint

### P0-1 — Spin reveal gap (visible blank frame) — `ShuffleZone.tsx` + `App.tsx`

**Bug**: Two independent timers must agree on when the winner card appears, and they don't.
- `App.tsx` `randomize()` sets `currentFood` + `phase="result"` after **1200ms**.
- `ShuffleZone.tsx` flips its local `showWinner=true` (and clears the last ghost) at **600ms**.

The winner `<motion.div>` requires BOTH `showWinner`/`phase==="result"` **and** `currentFood`.
Between 600ms and 1200ms `showWinner` is true but `currentFood` is still `null` → the shuffle zone
renders an **empty 320px box for ~600ms** every spin. The intended suspense is broken.

**Fix** — make `phase==="result"` the single source of truth for the reveal; drop the duplicate
`showWinner` timer; let `AnimatePresence` swap ghost → winner.

In `ShuffleZone.tsx`:
- Remove the `showWinner` state entirely (`const [showWinner, setShowWinner] = useState(false)`).
- Replace the effect with a timer-only version (this also fixes lint P0-2b — no synchronous
  `setState` in the effect body; the reset moves to cleanup):

```tsx
useEffect(() => {
  if (phase !== "spinning") return;
  const t0 = setTimeout(() => setGhostIndex(0), 0);
  const t1 = setTimeout(() => setGhostIndex(1), 200);
  const t2 = setTimeout(() => setGhostIndex(2), 400);
  return () => {
    clearTimeout(t0);
    clearTimeout(t1);
    clearTimeout(t2);
    setGhostIndex(-1);
  };
}, [phase]);
```

- Winner block condition becomes simply: `phase === "result" && currentFood` (remove the
  `(phase === "spinning" && showWinner) ||` clause).

In `App.tsx` `randomize()`:
- Change the spin duration from `1200` to **`700`** ms:
  `setTimeout(() => { ... }, 700);`
  Ghosts show at 0 / 200 / 400 ms; the last ghost holds until 700 ms, then `phase="result"`
  cross-fades to the winner via `AnimatePresence mode="wait"`.

**Acceptance**: spin shows ghost cards then the winner with **no blank frame** and no flash of an
empty card; total spin feels ~0.7s; the pulsing button stops exactly when the winner lands.

### P0-2 — Lint: 3 errors → 0

**a) `useGeolocation.ts:24` — `no-empty`** (empty `catch {}`)
Add an explanatory comment so the block is intentional:
```ts
} catch {
  /* Permissions API unsupported in this browser — fall through and prompt directly */
}
```

**b) `ShuffleZone.tsx:49` — `react-hooks/set-state-in-effect`**
Fixed by the P0-1 rewrite above (no synchronous `setState` in effect body; init via `setTimeout(…,0)`,
reset via cleanup). No `eslint-disable` needed.

**c) `SwipeMode.tsx:27` — `react-hooks/set-state-in-effect`** (`useEffect(() => setIndex(0), [foodKey])`)
Replace the effect with React's official "adjust state during render" pattern, keyed on the `foods`
reference (which is already a stable memo from `App.tsx`'s `filteredFoods`, so the `foodKey`
string memo is no longer needed — remove it):

```tsx
const shuffled = useMemo(() => shuffle(foods), [foods]);
const [prevFoods, setPrevFoods] = useState(foods);
const [index, setIndex] = useState(0);
if (foods !== prevFoods) {
  setPrevFoods(foods);
  setIndex(0);
}
```
- Remove the now-unused `foodKey` `useMemo` and the `useEffect` import (and `useEffect` itself).
- This simultaneously resolves the **`SwipeMode.tsx:24` exhaustive-deps warning** (P0-3) because
  `shuffle(foods)` now correctly depends on `[foods]`.

### P0-3 — Lint: 2 warnings → 0

**a) `SwipeMode.tsx:24`** — resolved by P0-2c above.

**b) `App.tsx:136` — `react-hooks/exhaustive-deps`** (`triedIds` useMemo missing `history`)
Adding `history` would recompute on every render (it's a fresh object each render) and re-read
`localStorage` needlessly. The set only needs refreshing after a pick (`phase` transition) or when
the discovery sheet opens. Add `showDiscovery` to the deps and suppress the `history` warning with a
justifying comment:

```tsx
// triedIds is recomputed only after a pick (phase) or when the discovery sheet opens;
// `history` is a stable accessor object, intentionally excluded.
// eslint-disable-next-line react-hooks/exhaustive-deps
const triedIds = useMemo(() => new Set(history.load().map((e) => e.foodId)), [phase, showDiscovery]);
```

**Acceptance for P0-2/P0-3**: `npm run lint` prints `0 problems`.

---

## P1 — Accessibility & Consistency

### P1-1 — Respect `prefers-reduced-motion` (WCAG 2.2.2)

No reduced-motion handling exists anywhere. The two **looping / auto-playing** animations are the
real concern. Use framer-motion's built-in hook (no new dependency):

```tsx
import { useReducedMotion } from "framer-motion";
```

**a) `ShuffleZone.tsx` → `IdlePrompt`** (infinite floating `y: [0,-8,0]`):
```tsx
const reduce = useReducedMotion();
// ...
<motion.div
  animate={reduce ? undefined : { y: [0, -8, 0] }}
  transition={reduce ? undefined : { repeat: Infinity, duration: 3, ease: "easeInOut" }}
  ...
```

**b) `RandomizeButton.tsx`** (infinite opacity pulse while spinning): when `useReducedMotion()` is
true, render the plain `{label}` instead of the pulsing `<motion.span>`:
```tsx
const reduce = useReducedMotion();
// ...
{isSpinning && !reduce ? (
  <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
    {label}
  </motion.span>
) : (
  label
)}
```

Entrance/exit transitions (card slide-in, sheet slide-up, swipe) are user-triggered and may remain.
**Acceptance**: with OS "Reduce motion" on, the idle dice no longer bobs and the spin button no
longer pulses; everything still functions.

### P1-2 — Mode toggle ARIA — `App.tsx`

The 🎲 สุ่ม / 👆 ปัด buttons are a toggle group but lack `aria-pressed` (the FilterBar pills have it).
Add to each:
- `aria-pressed={mode === "random"}` and `aria-label="โหมดสุ่ม"` on the random button.
- `aria-pressed={mode === "swipe"}` and `aria-label="โหมดปัดเลือก"` on the swipe button.

### P1-3 — Discovery modal a11y — `DiscoveryGrid.tsx`

The bottom sheet is a modal but is not announced and cannot be dismissed by keyboard.
- On the outer overlay `<motion.div>`, add: `role="dialog"`, `aria-modal="true"`,
  `aria-label="รายการอาหารที่ลองแล้ว"`.
- Add `aria-label="ปิด"` to the ✕ close button.
- Add Escape-to-close:
```tsx
useEffect(() => {
  const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [onClose]);
```
(`import { useEffect } from "react"`.)

**Acceptance**: opening the sheet, pressing Esc closes it; screen reader announces a dialog; the
close button has an accessible name.

### P1-4 — Contrast (surgical, legibility only) — `App.tsx`, `EmptyState.tsx`

Raise only the genuinely-too-low *interactive/instructional* text; leave decorative dots/footer subtle
to preserve the calm aesthetic.
- `App.tsx` — the discovery counter button (it is interactive and should be discoverable):
  `text-white/40` → **`text-white/55`** (the `className` on the `<button onClick={() => setShowDiscovery(true)}>`).
- `EmptyState.tsx` — the instruction line `ลองเลือก filter ใหม่นะ`: `text-white/30` → **`text-white/55`**.

Do NOT change the footer (`by Ik ☕`), the `·` separator dots (`text-white/20`), or `nameEN`
(`text-white/50`) — these are intentionally recessive.

### P1-5 — Content consistency — `index.html`

Meta says "55 เมนู" but there are **91** items. Fix both occurrences:
- `<meta name="description" content="กินอะไรดี? สุ่มอาหารไทย 91 เมนู เลือกมื้อ สุขภาพ สถานที่ แล้วกดสุ่ม!" />`
- `<meta property="og:description" content="สุ่มอาหารไทย 91 เมนู — ช่วยตัดสินใจว่าวันนี้กินอะไร" />`

---

## P2 — Optional (only if zero-risk and time permits)

- **P2-1** — `og:image`: social shares show no preview. **Skip unless** a static preview asset is
  added to `public/` (e.g. `public/og-cover.png`) and referenced via
  `<meta property="og:image" content="/og-cover.png" />`. Do NOT invent/scrape an external image.
  Acceptable to defer entirely.
- **P2-2** — The SwipeMode "next" preview card hand-rolls a mini-card. Leave as-is (refactoring risks
  visual regression; not worth it for polish).

---

## Out of Scope (do NOT do)

- No new food items, no edits to `foods.json`, no image swaps.
- No new filters, modes, or features.
- No new npm dependencies.
- No redesign of the color system or layout.
- No backend / API / persistence changes.

---

## Verification Checklist (Flufee self-check before notifying Supra)

1. `npm run lint` → **0 problems**.
2. `npm run build` → succeeds.
3. Spin in random mode 5×: ghosts → winner, **no blank frame** (P0-1).
4. OS Reduce-Motion ON: idle dice static, spin button not pulsing, app still works (P1-1).
5. Tab to mode toggle / discovery counter; open discovery sheet; press **Esc** → closes (P1-2/P1-3).
6. Discovery counter and empty-state text readable on dark bg (P1-4).
7. View source: meta says **91 เมนู** (P1-5).
8. Swipe mode: changing a filter resets the deck to the top; no reshuffle on unrelated re-renders.

When all pass → notify Supra for review.
