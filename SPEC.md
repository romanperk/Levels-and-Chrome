# Spec: Cyberpunk 2077 Leveling Guides

Status: **approved 2026-11-07**. Intent: [docs/intent/cyberpunk-leveling-guides.md](docs/intent/cyberpunk-leveling-guides.md).

## Objective

A static website of step-by-step leveling guides. A reader picks a build and edition, then follows it from level 1 to endgame.

**Primary user:** the owner, then players who know what build they want but not how to reach it. They often read on a phone or second screen while playing.

**Reader stories**

- On the home page, I can see which guides exist and whether each is for the base game or Phantom Liberty.
- At any level, I can jump straight to it and see where my attribute and perk points go.
- For my level range, I can see what cyberware and gear to get, which gun goes in each weapon slot, where to get them, and why.
- At any level, I can see the running attribute totals and points available, so I can tell if I've gone off the route.

**Author story**

- I write a guide as a YAML file. If it breaks a game rule, the build fails and tells me the level and the problem.

## Facts this design relies on

| Fact | Status | Source |
|---|---|---|
| Latest game version is 2.5 (hotfix 2.500.200, Oct 2026) | Reported by news outlets. Official notes not read | [MP1st](https://mp1st.com/?p=317528) |
| Base game cap is level 50, with 71 attribute and 70 perk points | Several guides, written around 2.0 | [GameRevolution](https://www.gamerevolution.com/guides/948286-cyberpunk-2077-phantom-liberty-attribute-points-how-many-stat-max-level-update-2-0), [Prima](https://primagames.com/gaming/what-is-the-cyberpunk-2077-phantom-liberty-level-cap-answered) |
| Phantom Liberty cap is level 60, with 81 attribute and 80 perk points | Same | Same |
| One attribute and one perk point per level; perk totals also rely on shards | Same | Same |
| Ripperdoc cyberware tiers change about every 10 levels, with Tier 5 from level 40 | One guide (2.1), plus an anecdote for Tier 2 at level 10 | [RPG Site](https://www.rpgsite.net/feature/10602-cyberpunk-2077-21-cyberware-list-best-cyberware-where-to-get-legendary-cyberware-in-phantom-liberty) |
| Dual-wielding comes from the free 2.5 Double Trouble perk (Cool 9), for Power Pistols and Power Revolvers in the primary and secondary slots | Third-party guides. Official notes not read | [Beebom](https://beebom.com/cyberpunk-2077-dual-wield-guide/), [TweakTown](https://tweaktown.com/news/114231/cyberpunk-2077-patch-2-5-adds-dual-wield-pistols-edgerunners-2-quests-and-cross-platform-mods) |
| Double Trouble has 2 ranks; the second unlocks Heywood Hurricane. Four perks surround it. All players have 3 weapon slots, and one can hold two guns | Owner, from play | - |
| Attributes start at 3, with 7 creation points (6 max per attribute at creation, 20 after) | Guides | [Prima](https://primagames.com/gaming/cyberpunk-2077-character-creation-guide) |
| Capacity starts at 24 and rises 3 per level (201 at level 60), plus shards, Engineering skill and perks | Guides and wiki, about 2.0 | [GamerGuides](https://www.gamerguides.com/cyberpunk-2077/guide/equipment/cyberware/cyberware-capacity-shards-how-to-increase-cyberware-capacity-in-patch-2-0), [Wiki](https://cyberpunk.fandom.com/wiki/Cyberpunk_2077_Stats) |
| No ready-made perk or cyberware dataset found | One search only | [REDmodding wiki](https://wiki.redmodding.org/cyberpunk-2077-modding/for-mod-creators-theory/tweaks/tweaks) |

None of the game numbers have been checked against 2.5. All of them live in `src/data/`, so correcting one never requires a code change.

## Legal constraints

From CDPR's [Fan Content Guideline](https://cdprojektred.com/fan-content/) (informal guidance; the User Agreement and EULA take priority and were not read):

- Community websites and screenshots are expressly allowed.
- **The domain must not contain the game or company name, trademarks, or anything similar.** The repo folder name is fine, but the public site needs a different name.
- Every page displays: "This is an unofficial fan work and is not approved/endorsed by CD PROJEKT RED".
- No commercial use and no paywall. Reasonable donations are allowed. Ads are not addressed, so V1 has none.
- Item icons are not mentioned, so **V1 uses no game icons** and no CDPR logos.
- Short descriptions are written in our own words.
- CDPR receives a permanent license to use fan content in connection with its games. Community authors must be told this when publishing opens.

## Tech Stack

- **Astro** (current stable, pinned at setup) with TypeScript. Pages are static HTML, and content collections validate guide files at build time, which replaces a custom loader.
- **Tailwind CSS**, as in the owner's other projects.
- **Vitest** for the rule checks.
- **No React in V1.** Nothing here needs it, and Astro can add it later as interactive islands.
- **Hosting:** Vercel, on a free `*.vercel.app` subdomain. A custom domain can come later. The subdomain also avoids the game and company names.

## Commands

```
Install: npm install
Dev:     npm run dev
Build:   npm run build     # also validates every guide; invalid guide = failed build
Test:    npm test          # vitest run
Types:   npx astro check
```

## Project Structure

```
docs/intent/                 Confirmed intent
SPEC.md                      This file
src/content.config.ts        Schemas for guides and game data
src/content/guides/*.yaml    One file per guide and edition
src/data/rules.yaml          Level caps, point totals, weapon slots, tier-by-level table
src/data/perks.yaml          Perks used by guides
src/data/cyberware.yaml      Cyberware used by guides
src/lib/validateGuide.ts     Rule checks (pure function)
src/lib/validateGuide.test.ts
src/lib/buildState.ts        Running totals per level
src/pages/index.astro        Guide list, grouped by edition
src/pages/guides/[id].astro  Guide page; runs validateGuide and fails the build on errors
src/components/              Astro components
```

## Guide Format

A build with both editions is two guide files, because the route differs. Game data is entered by hand and only for items a guide uses, so it grows with the guides.

```yaml
title: Example Build
edition: phantom-liberty      # or base-game
patch: "2.5"                  # shown on the page
summary: What the finished build does.
startingAttributes: { body: 3, reflexes: 3, technical: 3, intelligence: 3, cool: 3 }

levels:
  - level: 2
    attributes: [reflexes]     # usually one; empty or several when saving points or using shards
    perks: [example-perk]
    bonus:                     # points not granted by leveling
      - { type: perk, amount: 1, source: "Perk shard, where to find it" }
    note: Optional reason or warning.

cyberwareStages:
  - from: 1                    # the author sets each range
    to: 9
    cyberware:
      - { id: example-implant, tier: 1, where: "Ripperdoc name, district", why: "Reason" }
    weaponSlots:               # recommended gun for each slot in this stage
      - { slot: 1, name: "Example pistol", where: "Vendor or quest", why: "Reason" }
      - slot: 2
        name: "Example revolver"
        where: "Vendor or quest"
        why: "Reason"
        dualWith: { name: "Second gun", where: "Vendor or quest", why: "Reason" }   # needs Double Trouble
    gear:                      # optional: anything else worth getting
      - { name: "Example item", where: "Vendor or quest", why: "Reason" }
```

Each stage lists the full cyberware and weapon setup by its last level, not only what's new. `bonus.type` is `perk`, `attribute`, `relic` or `capacity`. Weapon and gear names are free text in V1, so the names aren't checked. The game database will replace them later.

## Rule Checks

`validateGuide` reports every problem, not only the first, and each error names the level.

1. Every level from 2 to the edition's cap appears exactly once, in order. A guide marked `draft: true` only has to be complete up to its last listed level.
2. Attribute points spent never exceed points available. No attribute goes above its maximum.
3. Perk points spent never exceed points earned so far, including bonuses. The same applies to relic points.
4. Each perk exists, its attribute requirement is met, and its prerequisite is taken first.
5. Cyberware exists, its tier is available by the stage's last level, and capacity isn't exceeded by the stage's full setup. Capacity counts level gains, `capacity` bonuses and perks with `capacityBonus` (such as Edgerunner).
6. Cyberware stages run in order, without gaps or overlaps, up to the cap.
7. A base-game guide uses no Phantom Liberty perks, cyberware or relic points.
8. Each stage has at least one weapon slot. Slot numbers are unique and within the game's slot count. At most one slot has `dualWith`, and only once Double Trouble has been taken.

## Code Style

Small pure functions. Data keeps the shape it has in YAML, with no classes or mapping layers. Rule checks return readable messages:

```ts
export function validateGuide(guide: Guide, game: GameData): string[] {
  const errors: string[] = [];
  const state = startState(guide);

  for (const step of guide.levels) {
    applyStep(state, step);
    for (const id of step.perks ?? []) {
      const perk = game.perks[id];
      if (!perk) errors.push(`Level ${step.level}: unknown perk "${id}"`);
      else if (state.attributes[perk.attribute] < perk.requires) {
        errors.push(`Level ${step.level}: ${perk.name} needs ${perk.attribute} ${perk.requires}`);
      }
    }
  }
  return errors;
}
```

Names: `camelCase` in code, `kebab-case` for file names and data ids, except `PascalCase` for Astro components.

## Testing Strategy

- **Vitest, next to the code.** One valid guide fixture, plus at least one failing case per rule above.
- **`npm run build`** validates the real guides against the real data.
- **Manual check before launch:** guide page at 360 px wide and on a real phone. Keyboard navigation works and headings are in a sensible order.
- **Real test:** the owner plays with the guide.
- No end-to-end browser tests in V1, because there's little behavior beyond static pages.

## Boundaries

- **Always:** Run `npm test` and `npm run build` before committing. Show the unofficial notice on every page. Label edition and patch on every guide. Keep game numbers in `src/data/`.
- **Ask first:** New dependencies, publishing or deploying, buying a domain, using game icons, adding ads or donations, changing the guide format after real guides exist.
- **Never:** Use the game or company name in a domain. Paywall content. Copy description text or art from other sites. Weaken or skip a rule check to make a guide pass.

## Success Criteria

**V1 done when**

1. The home page lists guides, with the edition obvious without opening one.
2. Each level has a link target, and a reader can reach any level within two taps.
3. Every level from 2 to the cap shows the attribute point, perks, running totals and points left.
4. Every level range shows cyberware, recommended weapon slots and any gear, with where and why.
5. Tests cover all eight rules. A guide that breaks one fails the build, naming the level.
6. Pages are readable at 360 px with no horizontal scrolling, and guide content works with JavaScript off.
7. The unofficial notice is on every page, and no game icons or logos are used.
8. At least one complete guide exists. **The owner finishes a new playthrough using only that guide** and doesn't need to search for what to do next.
9. Before public launch: 2-3 guides, with the game data checked against the current patch.

**Later work stays cheap if** guide files need no format change to be stored in a database, and `validateGuide` runs unchanged on a server. Neither is built in V1.

## Not in V1

Public planner, editor UI, accounts, backend, database, comments, ratings, auto-generated routes, mods, older patches, level-progress tracking, search, ads.

## Later: Game Database

A full database of what the game offers (guns, cyberware, attributes, perks, relic points and so on), so authors can pick from it instead of typing. It comes with community publishing. V1's hand-entered `src/data/` files are its starting point.

## Decisions

- **V1 game data:** entered by hand, only what guides use.
- **Points outside leveling:** guides state the bonuses they assume, and readers compare against the running totals. The first playthrough tests this.
- **First guide:** a dual-wield build.
- **Git:** initialize a repository when implementation starts.
- **First guide edition:** Phantom Liberty.
- **Site name:** Levels and Chrome, at `levels-and-chrome.vercel.app`, if that name is available at deploy time.

## Open Questions

1. **Did 2.5 change progression?** Perks, capacity or tiers may have changed. This needs the official notes and an in-game check before the first real guide is written.
