import { describe, expect, it } from 'vitest';
import { buildState } from './buildState';
import type { Guide, Perk, Rules } from './schema';

const rules = { pointsPerLevel: { attribute: 1, perk: 1 } } as Rules;
const perks: Record<string, Perk> = {
  shot: { name: 'Shot', tree: 'cool', requires: 0, phantomLiberty: false, capacityBonus: 0, cost: 1 },
  relic: { name: 'Relic', tree: 'relic', requires: 0, phantomLiberty: true, capacityBonus: 0, cost: 1 },
  bigRelic: { name: 'Big Relic', tree: 'relic', requires: 0, phantomLiberty: true, capacityBonus: 0, cost: 3 },
};
const empty = { attributes: [], perks: [], bonus: [] };
const guide = (levels: Guide['levels']) =>
  ({
    startingAttributes: { body: 3, reflexes: 3, technical: 3, intelligence: 3, cool: 10 },
    levels,
  }) as Guide;

describe('buildState', () => {
  it('adds attributes and spends points level by level', () => {
    const states = buildState(
      guide([
        { ...empty, level: 2, attributes: ['cool'] },
        { ...empty, level: 3, attributes: ['reflexes'], perks: ['shot'] },
      ]),
      rules,
      perks,
    );
    expect(states.get(2)).toMatchObject({ attributePointsLeft: 0, perkPointsLeft: 1 });
    expect(states.get(2)?.attributes.cool).toBe(11);
    expect(states.get(3)).toMatchObject({ attributePointsLeft: 0, perkPointsLeft: 1 });
    expect(states.get(3)?.attributes).toMatchObject({ reflexes: 4, cool: 11 });
  });

  it('charges a perk its full cost', () => {
    const bonus = [{ type: 'relic' as const, amount: 3, source: 'Terminal' }];
    const states = buildState(guide([{ ...empty, level: 2, perks: ['bigRelic'], bonus }]), rules, perks);
    expect(states.get(2)).toMatchObject({ relicPointsLeft: 0 });
  });

  it('carries unspent points forward', () => {
    const states = buildState(guide([{ ...empty, level: 2 }, { ...empty, level: 3 }]), rules, perks);
    expect(states.get(3)).toMatchObject({ attributePointsLeft: 2, perkPointsLeft: 2 });
  });

  it('counts bonuses and spends relic perks from relic points', () => {
    const states = buildState(
      guide([
        {
          ...empty,
          level: 2,
          perks: ['relic'],
          bonus: [
            { type: 'relic', amount: 2, source: 'Terminal' },
            { type: 'perk', amount: 1, source: 'Shard' },
            { type: 'attribute', amount: 1, source: 'Shard' },
          ],
        },
      ]),
      rules,
      perks,
    );
    expect(states.get(2)).toMatchObject({
      relicPointsLeft: 1,
      perkPointsLeft: 2,
      attributePointsLeft: 2,
    });
  });
});
