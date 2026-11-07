# Dual-Wield Build Research

Working notes for `src/content/guides/dual-wield-gunslinger.yaml`. Collected on 2026-11-07. Perk data predates patch 2.5 except for Double Trouble. The owner corrects it while playing.

## Target at Level 60

Cool 20, Reflexes 20, Technical 20, Body 18, Intelligence 3, which uses exactly 81 points. Guides agree on Cool and Technical 20 and Intelligence 3, and differ by a few points on Reflexes and Body.

## Attribute Route

Online guides say Cool 9, Cool 20, Technical 20, Reflexes, then Body. This route follows the owner's preference for a base in every attribute before maxing Cool, then puts Reflexes before Technical because stronger Sandevistans need it.

| Levels | Spend on | Result | Why |
|---|---|---|---|
| Start | Character creation | Cool 6, Reflexes 6, Technical 4, Body 3, Intelligence 3 | Reflexes 6 fits the first Sandevistan |
| 2-4 | Cool | Cool 9 | Dual-wielding |
| 5-7 | Reflexes | Reflexes 9 | Dash |
| 8-12 | Technical | Technical 9 | Capacity perks |
| 13-18 | Body | Body 9 | Survivability, and Renaissance Punk capacity |
| 19-29 | Cool | Cool 20 | Deadeye at 15, Run 'N' Gun at 20 |
| 30-40 | Reflexes | Reflexes 20 | Mk.3 at 12, Air Dash at 15, Apogee at level 40 |
| 41-51 | Technical | Technical 20 | License to Chrome at 15, Edgerunner at 20 |
| 52-60 | Body | Body 18 | Adrenaline Rush at 15 |

**Known trade-off:** Adrenaline Rush arrives only at level 57. Moving Technical or Body earlier delays the Apogee requirement or Edgerunner.

## Perks

Every perk in the guide is in `src/data/perks.yaml` with its requirement. The route spends only the 59 points from leveling, so perk shards (about 21 more) are extras.

- **From build guides:** the Double Trouble branch, Focus, Head to Head, Deep Breath, Deadeye, High Noon, Long Shot, California Reaper, Quick Draw, Run 'N' Gun, Dash, Air Dash, Steady Grip, Can't Touch This, Muscle Memory, All Things Cyber, Renaissance Punk, License to Chrome, Extended Warranty, Edgerunner, Ticking Time Bomb, Adrenaline Rush, Painkiller, Vulnerability Analytics, Machine Learning.
- **Our additions:** Slippery (required for Dash), Driver Update, Nerves of Tungsten-Steel, Multitasker, Glutton for War and Health Freak, Aerodynamic, Tailwind, Comeback Kid, Speed Junkie, Dorph-head, Ambidextrous, Cyborg, Pyromania (required for Ticking Time Bomb), Juggernaut, Calm Mind, Unstoppable Force.
- **Timing:** guides don't say when to take perks, except for the Double Trouble branch, so the order is our judgment.

**Relic points:** 3 from Songbird in Dog Eat Dog, 3 more about halfway through the story, and 1 per yellow Militech terminal in Dogtown. The first perk in a branch costs 3, the others cost 1.

## Cyberware

Ripperdocs share one inventory since 2.0, and higher levels unlock higher tiers.

- **Sandevistan:** Zetatech Mk.1, Mk.2, then Mk.3, then Apogee. Zetatech was chosen over Dynalar for its crit chance and because one guide praises its cooldown. Stats come from a September 2023 Game8 page, and the two sources disagree on Falcon. Apogee's requirement and price are unknown.
- **Capacity:** only Tier 5 costs are known (Apogee 44, Cockatrice 30, Peripheral Inverse 32, Axolotl 55), from a summary of one guide. Everything else is unknown.
- **Levels 1-9:** still empty. We don't have prologue or early purchase data.

## Weapons

Only Power Pistols and Power Revolvers can be dual-wielded, and different guns can be paired.

- **Dual pair:** two La Chingona Doradas, the owner's choice. Guides also pair a Dorada with Kongou or Malorian Arms 3516 (from Grayson, Chippin' In), or use Archangel with an Overture for revolvers.
- **Slot 2, sniper:** Overwatch. No guide covers this slot, so it's our pick. Other Power snipers: O'Five, Borzaya, NDI Osprey, Sparky.
- **Slot 3, assault rifle:** Hawk from level 30. Also our pick. Other Power rifles: Carmen, Kyubi X-MOD2, Umbra X-MOD2, Moron Labe, Psalm 11:6, Prejudice.
- **Upgrades:** iconics can be recrafted at a higher tier, consuming the copy you hold.

## Questions for Play

- Are Doradas realistic by level 9, or do they belong in the next stage?
- What cyberware does Viktor give you in the prologue, and what's worth buying before level 10?
- What are the real capacity costs, and do these setups fit?
- What does the Apogee require?
- Do the sniper and assault rifle earn their slots?
- Is Adrenaline Rush at level 57 too late?

## Sources

- [games.gg: Double Trouble build](https://games.gg/cyberpunk-2077/guides/dual-wield-double-trouble-build/)
- [KeenGamer: Best dual-wield build](https://www.keengamer.com/articles/guides/cyberpunk-2077-best-dual-wield-build-weapons-perks-cyberware/)
- [Power Up Gaming: Best dual-wield builds](https://powerupgaming.co.uk/2026/10/23/cyberpunk-2077-best-dual-wield-builds-update-2-5/)
- [Of Zen and Computing: How to dual-wield pistols](https://www.ofzenandcomputing.com/how-to-dual-wield-pistols-in-cyberpunk-2077/)
- [Whisper of the House: Dual wield](https://www.whisperofthehouse.com/cyberpunk-2077/dual-wield)
- [Game8: Perks and skill tree](https://game8.co/games/Cyberpunk-2077/archives/309686)
- [Game8: Relic perks](https://game8.co/games/Cyberpunk-2077/archives/422665)
- [Game8: Sandevistan locations](https://game8.co/games/Cyberpunk-2077/archives/393374)
- [Game8: Ripperdocs and cyberware](https://game8.co/games/Cyberpunk-2077/archives/314454)
- [eip.gg: Technical perks](https://eip.gg/cyberpunk-2077/guides/technical-ability-perks/), [Body perks](https://eip.gg/cyberpunk-2077/guides/body-perks/), [Relic perks](https://eip.gg/cyberpunk-2077/guides/relic-perks/), [perk hub](https://eip.gg/cyberpunk-2077/guides/perks/)
- [RPG Site: Iconic weapons](https://www.rpgsite.net/feature/10582-cyberpunk-2077-iconic-weapons-all-unique-iconic-weapon-locations-in-version-20-and-phantom-liberty), [Cyberware list](https://www.rpgsite.net/feature/10602-cyberpunk-2077-21-cyberware-list-best-cyberware-where-to-get-legendary-cyberware-in-phantom-liberty)
- [SegmentNext: Iconic weapons](https://segmentnext.com/cyberpunk/iconic-weapons)
- [GamerGuides: Capacity](https://www.gamerguides.com/cyberpunk-2077/guide/equipment/cyberware/cyberware-capacity-shards-how-to-increase-cyberware-capacity-in-patch-2-0), [Iconic cyberware](https://www.gamerguides.com/cyberpunk-2077/guide/phantom-liberty/gameplay/all-iconic-cyberware-locations-in-phantom-liberty)
