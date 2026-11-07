# Tasks: Cyberpunk 2077 Leveling Guides

Every task must also pass `npm test` and `npm run build` once those exist.

## Phase 1: Foundation

- [x] **Task 1: Confirm progression rules for 2.5** (XS)
  - Accept: `src/data/rules.yaml` holds level caps, starting and per-level points, attribute maximum, weapon slot count, capacity income and tier-by-level table. Each value is marked as checked in-game, from official notes, or unconfirmed.
  - Verify: Official 2.5 notes read. Owner checks the unconfirmed values in their current playthrough.
  - Depends on: none. Files: `src/data/rules.yaml`

- [x] **Task 2: Scaffold the site with the unofficial notice** (S)
  - Accept: Astro, TypeScript, Tailwind and Vitest are installed at pinned versions. Git is initialized. A shared layout shows the exact notice from the spec.
  - Verify: `npm run build`, `npm test`, `npx astro check`. Notice visible on the placeholder home page.
  - Depends on: none. Files: `package.json`, config files, `src/layouts/Layout.astro`, `src/pages/index.astro`

## Phase 2: Guide Page

- [x] **Task 3: Show a guide's levels** (M)
  - Accept: A short sample guide renders at `/guides/<id>`, with title, edition, patch, summary and a row per level (attribute, perks, bonuses, note). Each level has a link target, and a jump menu reaches any level.
  - Verify: Build. Open a `#level-N` link. Malformed YAML fails with a schema error.
  - Depends on: 2. Files: `src/content.config.ts`, `src/content/guides/sample.yaml`, `src/data/perks.yaml`, `src/pages/guides/[id].astro`

- [x] **Task 4: Show running totals at each level** (S)
  - Accept: Each level row shows attribute totals and perk points left, including bonuses.
  - Verify: Unit tests for `buildState`. Totals on the sample page match a hand calculation.
  - Depends on: 3. Files: `src/lib/buildState.ts`, `src/lib/buildState.test.ts`, guide page

- [x] **Task 5: Show cyberware stages and weapon slots** (M)
  - Accept: Each stage shows cyberware with tier, recommended weapon slots and optional gear, each with where and why. A reader can tell which stage applies at their level.
  - Verify: Build and check the sample page. No level range is missing.
  - Depends on: 3. Files: `src/content.config.ts`, `src/data/cyberware.yaml`, `src/components/Stage.astro`, guide page, sample guide

- [x] **Task 6: List guides by edition on the home page** (S)
  - Accept: Guides are grouped under base game and Phantom Liberty, each with its patch and summary.
  - Verify: Two sample guides appear under the right headings, and links work.
  - Depends on: 3. Files: `src/pages/index.astro`, one more sample guide

**Checkpoint:** Owner reviews a sample guide at 360 px and approves the format.

## Phase 3: Rule Checks

Tests come first for Tasks 7-9, with a failing fixture per rule.

- [x] **Task 7: Check level order and attribute and perk points (rules 1-3)** (S)
  - Accept: Missing or duplicate levels and overspent attribute, perk or relic points produce messages naming the level.
  - Verify: `npm test`. Files: `src/lib/validateGuide.ts`, `src/lib/validateGuide.test.ts`
  - Depends on: 4.

- [x] **Task 8: Check perk and cyberware requirements (rules 4-5)** (S)
  - Accept: Unknown perks, unmet attribute or prerequisite requirements, tiers not yet available and exceeded capacity are all reported.
  - Verify: `npm test`. Files: same as Task 7
  - Depends on: 5, 7.

- [x] **Task 9: Check stages, edition and weapon slots (rules 6-8)** (S)
  - Accept: Stage gaps or overlaps, Phantom Liberty content in base-game guides, and missing, duplicate or out-of-range weapon slots, plus `dualWith` on more than one slot or before Double Trouble, are all reported.
  - Verify: `npm test`. Files: same as Task 7
  - Depends on: 5, 7.

- [x] **Task 10: Fail the build on rule errors** (XS)
  - Accept: The guide page validates in `getStaticPaths` and throws every error for that guide.
  - Verify: Temporarily break the sample guide and see the build fail with its level. Restore it.
  - Depends on: 8, 9. Files: `src/pages/guides/[id].astro`, sample guides

**Checkpoint:** All eight rules are tested, and a broken guide fails the build.

## Phase 4: Real Content

- [ ] **Task 11: Write levels 1-19 of the dual-wield guide** (M)
  - Accept: The first stage is complete, including Double Trouble timing if it falls in range, and all items used are in `src/data/`. Levels past 19 stay out of the file until the format is proven, so this draft uses `draft: true`, which Task 12 removes.
  - Verify: Build passes. **Owner plays levels 1-19 on a new character using only this page** and reports what was missing.
  - Depends on: 1, 10; first guide edition chosen. Files: `src/content/guides/dual-wield.yaml`, `src/data/*.yaml`

- [ ] **Task 12: Finish the dual-wield guide** (M) *(written through level 60; owner's playthrough still pending)*
  - Accept: The guide reaches the edition's cap, with `draft: true` removed. Fixes from the Task 11 playtest are in.
  - Verify: Build passes with all rules. Owner completes the playthrough (spec success criterion 8).
  - Depends on: 11. Files: same as Task 11

**Checkpoint:** Owner has tested levels 1-10 in play, and the format still works.

## Phase 5: Polish and Launch

- [x] **Task 13: Apply the visual design** (M)
  - Accept: A distinct design built for reading while playing, with no CDPR logos or game icons. Yellow theme kept by owner's decision.
  - Verify: Review at 360 px and desktop, in light and dark surroundings.
  - Depends on: 6, 10. Files: layout, components, styles

- [ ] **Task 14: Run the pre-launch check** (S)
  - Accept: Criteria 1-8 checked. Works with JavaScript off, keyboard navigation works, headings are in order, and no horizontal scroll at 360 px. User Agreement and EULA read for conflicts with the fan guideline.
  - Verify: Manual checklist on a real phone. Results reported to owner.
  - Depends on: 12, 13.

- [ ] **Task 15: Choose a name and deploy (needs owner approval)** (S)
  - Accept: The `*.vercel.app` subdomain avoids the game and company names. The site is live on Vercel.
  - Verify: Live URL loads on a phone, and the notice is visible.
  - Depends on: 14; owner approves publishing. Files: `astro.config.mjs` if needed
