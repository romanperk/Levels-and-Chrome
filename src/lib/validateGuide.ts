import { buildState } from './buildState';
import { attributeLabels } from './labels';
import { attributeNames } from './schema';
import type { Cyberware, Guide, Perk, Rules } from './schema';

export interface GameData {
  rules: Rules;
  perks: Record<string, Perk>;
  cyberware: Record<string, Cyberware>;
}

const DOUBLE_TROUBLE = 'double-trouble';

export function validateGuide(guide: Guide, game: GameData): string[] {
  const errors = [
    ...checkLevels(guide, game),
    ...checkAttributesAndPoints(guide, game),
    ...checkPerks(guide, game),
    ...checkStages(guide, game),
    ...checkCyberware(guide, game),
    ...checkEdition(guide, game),
    ...checkWeaponSlots(guide, game),
  ];
  return errors;
}

// A draft guide only has to be complete up to its last listed level.
function lastLevel(guide: Guide, game: GameData): number {
  if (!guide.draft) return game.rules.editions[guide.edition].levelCap;
  return Math.max(1, ...guide.levels.map((s) => s.level));
}

function checkLevels(guide: Guide, game: GameData): string[] {
  const errors: string[] = [];
  const cap = game.rules.editions[guide.edition].levelCap;
  const listed = guide.levels.map((s) => s.level);
  const last = lastLevel(guide, game);

  for (let level = 2; level <= last; level++) {
    const count = listed.filter((l) => l === level).length;
    if (count === 0) errors.push(`Level ${level}: missing`);
    if (count > 1) errors.push(`Level ${level}: listed ${count} times`);
  }
  for (const level of listed) {
    if (level < 2 || level > cap) errors.push(`Level ${level}: outside levels 2 to ${cap}`);
  }
  // Running totals assume this order.
  if (listed.some((level, i) => i > 0 && level < listed[i - 1])) {
    errors.push('Levels: not in ascending order');
  }
  return errors;
}

function checkAttributesAndPoints(guide: Guide, game: GameData): string[] {
  const errors: string[] = [];
  const { starting, creationPoints, creationMaximum, maximum } = game.rules.attributes;

  let startingTotal = 0;
  for (const name of attributeNames) {
    const value = guide.startingAttributes[name];
    startingTotal += value;
    if (value < starting || value > creationMaximum) {
      errors.push(`Start: ${attributeLabels[name]} must be ${starting} to ${creationMaximum}, is ${value}`);
    }
  }
  const allowed = starting * attributeNames.length + creationPoints;
  if (startingTotal > allowed) errors.push(`Start: attributes total ${startingTotal}, maximum is ${allowed}`);

  const states = buildState(guide, game.rules, game.perks);
  for (const state of states.values()) {
    const at = `Level ${state.level}`;
    if (state.attributePointsLeft < 0) errors.push(`${at}: overspent attribute points by ${-state.attributePointsLeft}`);
    if (state.perkPointsLeft < 0) errors.push(`${at}: overspent perk points by ${-state.perkPointsLeft}`);
    if (state.relicPointsLeft < 0) errors.push(`${at}: overspent relic points by ${-state.relicPointsLeft}`);
    for (const name of attributeNames) {
      if (state.attributes[name] > maximum) {
        errors.push(`${at}: ${attributeLabels[name]} is ${state.attributes[name]}, maximum is ${maximum}`);
      }
    }
  }
  return errors;
}

function checkPerks(guide: Guide, game: GameData): string[] {
  const errors: string[] = [];
  const states = buildState(guide, game.rules, game.perks);
  const taken = new Set<string>();

  for (const step of guide.levels) {
    const state = states.get(step.level)!;
    for (const id of step.perks) {
      const at = `Level ${step.level}`;
      const perk = game.perks[id];
      if (!perk) {
        errors.push(`${at}: unknown perk "${id}"`);
        continue;
      }
      if (taken.has(id)) errors.push(`${at}: ${perk.name} already taken`);
      if (perk.tree !== 'relic' && state.attributes[perk.tree] < perk.requires) {
        errors.push(`${at}: ${perk.name} needs ${attributeLabels[perk.tree]} ${perk.requires}, has ${state.attributes[perk.tree]}`);
      }
      if (perk.prerequisite && !taken.has(perk.prerequisite)) {
        errors.push(`${at}: ${perk.name} needs ${game.perks[perk.prerequisite]?.name ?? perk.prerequisite} first`);
      }
      taken.add(id);
    }
  }
  return errors;
}

function checkStages(guide: Guide, game: GameData): string[] {
  const errors: string[] = [];
  const last = lastLevel(guide, game);
  let expectedFrom = 1;

  for (const stage of guide.cyberwareStages) {
    const at = `Stage ${stage.from}-${stage.to}`;
    if (stage.from > stage.to) errors.push(`${at}: starts after it ends`);
    if (stage.from > expectedFrom) errors.push(`${at}: gap, levels ${expectedFrom} to ${stage.from - 1} have no stage`);
    if (stage.from < expectedFrom) errors.push(`${at}: overlaps the previous stage`);
    expectedFrom = stage.to + 1;
  }
  if (expectedFrom <= last) errors.push(`Stages: levels ${expectedFrom} to ${last} have no stage`);
  if (expectedFrom - 1 > last) errors.push(`Stages: run past level ${last}`);
  return errors;
}

// Each stage lists the full setup by its last level, so tier and capacity are checked there.
function checkCyberware(guide: Guide, game: GameData): string[] {
  const errors: string[] = [];
  const { capacity, tierFromLevel } = game.rules;

  for (const stage of guide.cyberwareStages) {
    const at = `Stage ${stage.from}-${stage.to}`;
    let used = 0;

    for (const item of stage.cyberware) {
      const cyberware = game.cyberware[item.id];
      if (!cyberware) {
        errors.push(`${at}: unknown cyberware "${item.id}"`);
        continue;
      }
      const availableFrom = tierFromLevel[item.tier];
      if (availableFrom > stage.to) {
        errors.push(`${at}: ${cyberware.name} Tier ${item.tier} isn't available until level ${availableFrom}`);
      }
      // shortcut: items with unknown costs count as 0, so capacity can't be fully checked until they're filled in.
      if (!cyberware.capacity) continue;
      const cost = cyberware.capacity[item.tier];
      if (cost === undefined) errors.push(`${at}: ${cyberware.name} has no capacity cost for Tier ${item.tier}`);
      else used += cost;
    }

    let available = capacity.starting + capacity.perLevel * (stage.to - 1);
    for (const step of guide.levels) {
      if (step.level > stage.to) continue;
      for (const bonus of step.bonus) if (bonus.type === 'capacity') available += bonus.amount;
      for (const id of step.perks) available += game.perks[id]?.capacityBonus ?? 0;
    }
    if (used > available) errors.push(`${at}: cyberware uses ${used} capacity, ${available} available`);
  }
  return errors;
}

function checkEdition(guide: Guide, game: GameData): string[] {
  if (guide.edition !== 'base-game') return [];
  const errors: string[] = [];

  for (const step of guide.levels) {
    const at = `Level ${step.level}`;
    for (const id of step.perks) {
      const perk = game.perks[id];
      if (perk?.phantomLiberty || perk?.tree === 'relic') errors.push(`${at}: ${perk.name} needs Phantom Liberty`);
    }
    if (step.bonus.some((b) => b.type === 'relic')) errors.push(`${at}: relic points need Phantom Liberty`);
  }
  for (const stage of guide.cyberwareStages) {
    for (const item of stage.cyberware) {
      const cyberware = game.cyberware[item.id];
      if (cyberware?.phantomLiberty) errors.push(`Stage ${stage.from}-${stage.to}: ${cyberware.name} needs Phantom Liberty`);
    }
  }
  return errors;
}

function checkWeaponSlots(guide: Guide, game: GameData): string[] {
  const errors: string[] = [];
  const count = game.rules.weaponSlots;
  const doubleTroubleLevel = guide.levels.find((s) => s.perks.includes(DOUBLE_TROUBLE))?.level;

  for (const stage of guide.cyberwareStages) {
    const at = `Stage ${stage.from}-${stage.to}`;
    const slots = stage.weaponSlots.map((w) => w.slot);

    if (slots.length === 0) errors.push(`${at}: no weapon slots`);
    if (new Set(slots).size < slots.length) errors.push(`${at}: weapon slot listed twice`);
    for (const slot of slots) {
      if (slot < 1 || slot > count) errors.push(`${at}: weapon slot ${slot} is outside 1 to ${count}`);
    }

    const dual = stage.weaponSlots.filter((w) => w.dualWith);
    if (dual.length > 1) errors.push(`${at}: only one weapon slot can dual-wield`);
    if (dual.length > 0 && (doubleTroubleLevel === undefined || doubleTroubleLevel > stage.to)) {
      errors.push(`${at}: dual-wielding needs Double Trouble by level ${stage.to}`);
    }
  }
  return errors;
}
