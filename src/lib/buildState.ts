import type { AttributeName, Guide, Perk, Rules } from './schema';

export interface LevelState {
  level: number;
  attributes: Record<AttributeName, number>;
  attributePointsLeft: number;
  perkPointsLeft: number;
  relicPointsLeft: number;
}

// Running totals after each listed level. Overspending shows as a negative number; validateGuide reports it.
export function buildState(
  guide: Guide,
  rules: Rules,
  perks: Record<string, Perk>,
): Map<number, LevelState> {
  const attributes = { ...guide.startingAttributes };
  let attributePointsLeft = 0;
  let perkPointsLeft = 0;
  let relicPointsLeft = 0;
  const states = new Map<number, LevelState>();

  for (const step of guide.levels) {
    attributePointsLeft += rules.pointsPerLevel.attribute;
    perkPointsLeft += rules.pointsPerLevel.perk;

    for (const bonus of step.bonus) {
      if (bonus.type === 'attribute') attributePointsLeft += bonus.amount;
      if (bonus.type === 'perk') perkPointsLeft += bonus.amount;
      if (bonus.type === 'relic') relicPointsLeft += bonus.amount;
    }

    for (const name of step.attributes) {
      attributes[name] += 1;
      attributePointsLeft -= 1;
    }

    for (const id of step.perks) {
      if (perks[id]?.tree === 'relic') relicPointsLeft -= 1;
      else perkPointsLeft -= 1;
    }

    states.set(step.level, {
      level: step.level,
      attributes: { ...attributes },
      attributePointsLeft,
      perkPointsLeft,
      relicPointsLeft,
    });
  }
  return states;
}
