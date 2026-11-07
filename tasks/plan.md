# Implementation Plan: Cyberpunk 2077 Leveling Guides

Status: **approved 2026-11-07**. Spec: [SPEC.md](../SPEC.md). Task details: [todo.md](todo.md).

## Overview

Build a static Astro site that displays leveling guides stored as YAML, and fails the build if a guide breaks a game rule. The first guide is a dual-wield build. We confirm the game's rules first, then build one complete guide page, add rule checks, and write the real guide.

## Architecture Decisions

- **Rule checks run in `getStaticPaths` of the guide page.** Astro schemas check each file's shape, but cross-file checks are awkward inside them. Calling `validateGuide` from the page and throwing on errors fails both dev and build, with no extra script or dependency. (The spec's structure section reflects this.)
- **`validateGuide` and `buildState` are pure functions.** They take plain data, so they can be tested without Astro and run on a server later.
- **Game data loads through Astro's file loader.** No YAML dependency is needed unless the file loader falls short for `rules.yaml`.
- **Running totals are computed at build time and sent as HTML.** Guide content then works with JavaScript off.

## Dependency Graph

```
Confirm rules for 2.5 ─────────────────────────────┐
Scaffold ── Guide page (levels) ── Running totals ─┼── Rule checks ── Real guide ── Playtest
                 └── Stages and weapon slots ──────┘
                 └── Home page ── Visual design ── Launch check
```

## Task List

### Phase 1: Foundation
- [x] Task 1: Confirm progression rules for 2.5
- [x] Task 2: Scaffold the site with the unofficial notice

### Phase 2: Guide Page
- [x] Task 3: Show a guide's levels
- [x] Task 4: Show running totals at each level
- [x] Task 5: Show cyberware stages and weapon slots
- [x] Task 6: List guides by edition on the home page

### Checkpoint: Guide Page
- [ ] A sample guide reads correctly at 360 px. Owner reviews the format before rules depend on it.

### Phase 3: Rule Checks
- [ ] Task 7: Check level order and attribute and perk points (rules 1-3)
- [ ] Task 8: Check perk and cyberware requirements (rules 4-5)
- [ ] Task 9: Check stages, edition and weapon slots (rules 6-8)
- [ ] Task 10: Fail the build on rule errors

### Checkpoint: Rule Checks
- [ ] All eight rules are tested. A broken sample guide fails the build, naming the level.

### Phase 4: Real Content
- [ ] Task 11: Write levels 1-10 of the dual-wield guide
- [ ] Task 12: Finish the dual-wield guide

### Checkpoint: Content
- [ ] Owner has tested levels 1-10 in play and the format still works.

### Phase 5: Polish and Launch
- [ ] Task 13: Apply the visual design
- [ ] Task 14: Run the pre-launch check
- [ ] Task 15: Choose a name and deploy (needs owner approval)

### Checkpoint: Complete
- [ ] V1 success criteria 1-8 in the spec are met. Criterion 9 (2-3 guides) applies before public launch.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| 2.5 changed progression, so researched numbers are wrong | High | Task 1 comes first, and all numbers stay in `src/data/` |
| Points from shards and skill ranks make level-by-level routes unreliable | High | Test levels 1-10 in play (Task 11) before writing the rest |
| Writing every level by hand is tiring | Medium | Finish one guide before adding others. The owner reviews and plays it, rather than authoring everything alone |
| Base game and Phantom Liberty dual-wield details conflict between sources | Medium | Task 1 confirms them. Only the chosen edition is written first |
| Fan guideline changes, or the EULA conflicts with it | Low | Read the User Agreement and EULA before launch (Task 14) |

## Open Questions

None. First guide edition: Phantom Liberty. Site name: Levels and Chrome.
