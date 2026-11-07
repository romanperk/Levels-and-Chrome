import { describe, expect, it } from 'vitest';
import type { Guide } from './schema';
import { validateGuide, type GameData } from './validateGuide';

const game: GameData = {
  rules: {
    patch: '2.5',
    editions: {
      'base-game': { levelCap: 4, attributeTotal: 0, perkTotal: 0 },
      'phantom-liberty': { levelCap: 5, attributeTotal: 0, perkTotal: 0 },
    },
    attributes: { starting: 3, creationPoints: 7, creationMaximum: 6, maximum: 20 },
    pointsPerLevel: { attribute: 1, perk: 1 },
    weaponSlots: 3,
    capacity: { starting: 10, perLevel: 1 },
    tierFromLevel: { '1': 1, '2': 3 },
  },
  perks: {
    aim: { name: 'Aim', tree: 'reflexes', requires: 4, phantomLiberty: false, capacityBonus: 0 },
    steady: { name: 'Steady', tree: 'reflexes', requires: 4, prerequisite: 'aim', phantomLiberty: false, capacityBonus: 0 },
    chrome: { name: 'Chrome', tree: 'technical', requires: 0, phantomLiberty: false, capacityBonus: 50 },
    'double-trouble': { name: 'Double Trouble', tree: 'cool', requires: 3, phantomLiberty: false, capacityBonus: 0 },
    relic: { name: 'Relic', tree: 'relic', requires: 0, phantomLiberty: true, capacityBonus: 0 },
    spy: { name: 'Spy', tree: 'cool', requires: 0, phantomLiberty: true, capacityBonus: 0 },
  },
  cyberware: {
    optics: { name: 'Optics', slot: 'eyes', capacity: { '1': 5, '2': 8 }, phantomLiberty: false },
    heavy: { name: 'Heavy', slot: 'arms', capacity: { '1': 40 }, phantomLiberty: false },
    agent: { name: 'Agent', slot: 'eyes', capacity: { '1': 1 }, phantomLiberty: true },
    mystery: { name: 'Mystery', slot: 'legs', phantomLiberty: false },
  },
};

const slot = { slot: 1, name: 'Pistol', where: 'Shop', why: 'Good' };
const item = (id: string, tier = 1) => ({ id, tier, where: 'Doc', why: 'Good' });
const step = (level: number, extra: Partial<Guide['levels'][number]> = {}) => ({
  level,
  attributes: [],
  perks: [],
  bonus: [],
  ...extra,
});
const stage = (from: number, to: number, extra: Partial<Guide['cyberwareStages'][number]> = {}) => ({
  from,
  to,
  cyberware: [],
  weaponSlots: [slot],
  gear: [],
  ...extra,
});

function guide(extra: Partial<Guide> = {}): Guide {
  return {
    title: 'Test',
    edition: 'base-game',
    patch: '2.5',
    summary: 'Test',
    draft: false,
    startingAttributes: { body: 3, reflexes: 6, technical: 3, intelligence: 3, cool: 6 },
    levels: [
      step(2, { attributes: ['reflexes'], perks: ['aim'] }),
      step(3, { attributes: ['cool'], perks: ['steady'] }),
      step(4, { attributes: ['body'] }),
    ],
    cyberwareStages: [stage(1, 2, { cyberware: [item('optics')] }), stage(3, 4, { cyberware: [item('optics', 2)] })],
    ...extra,
  };
}

const errorsFor = (extra: Partial<Guide>) => validateGuide(guide(extra), game);

describe('validateGuide', () => {
  it('accepts a valid guide', () => {
    expect(validateGuide(guide(), game)).toEqual([]);
  });

  describe('rule 1: levels', () => {
    const stages = { cyberwareStages: [stage(1, 4)] };
    it('reports missing levels', () => {
      expect(errorsFor({ ...stages, levels: [step(2), step(4)] })).toContain('Level 3: missing');
    });
    it('reports duplicate levels', () => {
      expect(errorsFor({ ...stages, levels: [step(2), step(3), step(3), step(4)] })).toContain('Level 3: listed 2 times');
    });
    it('reports levels past the cap', () => {
      expect(errorsFor({ ...stages, levels: [step(2), step(3), step(4), step(5)] })).toContain('Level 5: outside levels 2 to 4');
    });
    it('reports levels out of order', () => {
      expect(errorsFor({ ...stages, levels: [step(3), step(2), step(4)] })).toContain('Levels: not in ascending order');
    });
    it('only needs a draft to be complete up to its last level', () => {
      expect(errorsFor({ draft: true, levels: [step(2)], cyberwareStages: [stage(1, 2)] })).toEqual([]);
    });
  });

  describe('rule 2: attributes', () => {
    it('reports overspent attribute points', () => {
      const levels = [step(2, { attributes: ['body', 'cool'] }), step(3), step(4)];
      expect(errorsFor({ levels })).toContain('Level 2: overspent attribute points by 1');
    });
    it('reports attributes above the maximum', () => {
      const startingAttributes = { body: 3, reflexes: 6, technical: 3, intelligence: 3, cool: 6 };
      const strict: GameData = {
        ...game,
        rules: { ...game.rules, attributes: { ...game.rules.attributes, maximum: 6 } },
      };
      const levels = [step(2, { attributes: ['cool'] }), step(3), step(4)];
      expect(validateGuide(guide({ startingAttributes, levels }), strict)).toContain('Level 2: Cool is 7, maximum is 6');
    });
    it('reports a starting attribute outside character creation limits', () => {
      const startingAttributes = { body: 2, reflexes: 7, technical: 3, intelligence: 3, cool: 3 };
      const errors = errorsFor({ startingAttributes });
      expect(errors).toContain('Start: Body must be 3 to 6, is 2');
      expect(errors).toContain('Start: Reflexes must be 3 to 6, is 7');
    });
    it('reports too many starting points', () => {
      const startingAttributes = { body: 6, reflexes: 6, technical: 6, intelligence: 3, cool: 3 };
      expect(errorsFor({ startingAttributes })).toContain('Start: attributes total 24, maximum is 22');
    });
  });

  describe('rule 3: perk and relic points', () => {
    it('reports overspent perk points', () => {
      const levels = [step(2, { perks: ['aim', 'steady'] }), step(3), step(4)];
      expect(errorsFor({ levels })).toContain('Level 2: overspent perk points by 1');
    });
    it('lets bonus points pay for extra perks', () => {
      const bonus = [{ type: 'perk' as const, amount: 1, source: 'Shard' }];
      const levels = [step(2, { perks: ['aim', 'steady'], bonus }), step(3), step(4)];
      expect(errorsFor({ levels })).toEqual([]);
    });
    it('reports overspent relic points', () => {
      const levels = [step(2, { perks: ['relic'] }), step(3), step(4), step(5)];
      const errors = errorsFor({ edition: 'phantom-liberty', levels, cyberwareStages: [stage(1, 5)] });
      expect(errors).toContain('Level 2: overspent relic points by 1');
    });
  });

  describe('rule 4: perks', () => {
    it('reports unknown perks', () => {
      const levels = [step(2, { perks: ['nope'] }), step(3), step(4)];
      expect(errorsFor({ levels })).toContain('Level 2: unknown perk "nope"');
    });
    it('reports an unmet attribute requirement', () => {
      const startingAttributes = { body: 3, reflexes: 3, technical: 3, intelligence: 3, cool: 3 };
      const levels = [step(2, { perks: ['aim'] }), step(3), step(4)];
      expect(errorsFor({ startingAttributes, levels })).toContain('Level 2: Aim needs Reflexes 4, has 3');
    });
    it('reports a missing prerequisite', () => {
      const levels = [step(2, { perks: ['steady'] }), step(3), step(4)];
      expect(errorsFor({ levels })).toContain('Level 2: Steady needs Aim first');
    });
    it('reports a perk taken twice', () => {
      const levels = [step(2, { perks: ['aim'] }), step(3, { perks: ['aim'] }), step(4)];
      expect(errorsFor({ levels })).toContain('Level 3: Aim already taken');
    });
  });

  describe('rule 5: cyberware', () => {
    it('reports unknown cyberware', () => {
      expect(errorsFor({ cyberwareStages: [stage(1, 4, { cyberware: [item('nope')] })] })).toContain('Stage 1-4: unknown cyberware "nope"');
    });
    it('reports a tier not yet available', () => {
      const cyberwareStages = [stage(1, 2, { cyberware: [item('optics', 2)] }), stage(3, 4)];
      expect(errorsFor({ cyberwareStages })).toContain("Stage 1-2: Optics Tier 2 isn't available until level 3");
    });
    it('reports a tier with no capacity cost', () => {
      const cyberwareStages = [stage(1, 2), stage(3, 4, { cyberware: [item('heavy', 2)] })];
      expect(errorsFor({ cyberwareStages })).toContain('Stage 3-4: Heavy has no capacity cost for Tier 2');
    });
    it('reports exceeded capacity', () => {
      const cyberwareStages = [stage(1, 4, { cyberware: [item('heavy')] })];
      expect(errorsFor({ cyberwareStages })).toContain('Stage 1-4: cyberware uses 40 capacity, 13 available');
    });
    it('accepts cyberware with an unknown capacity cost', () => {
      const cyberwareStages = [stage(1, 2), stage(3, 4, { cyberware: [item('mystery', 2)] })];
      expect(errorsFor({ cyberwareStages })).toEqual([]);
    });
    it('still checks the tier of cyberware with an unknown cost', () => {
      const cyberwareStages = [stage(1, 2, { cyberware: [item('mystery', 2)] }), stage(3, 4)];
      expect(errorsFor({ cyberwareStages })).toContain("Stage 1-2: Mystery Tier 2 isn't available until level 3");
    });
    it('still reports exceeded capacity beside an unknown cost', () => {
      const cyberwareStages = [stage(1, 4, { cyberware: [item('heavy'), item('mystery')] })];
      expect(errorsFor({ cyberwareStages })).toContain('Stage 1-4: cyberware uses 40 capacity, 13 available');
    });
    it('counts capacity from shards', () => {
      const bonus = [{ type: 'capacity' as const, amount: 27, source: 'Shards' }];
      const levels = [step(2, { bonus }), step(3), step(4)];
      expect(errorsFor({ levels, cyberwareStages: [stage(1, 4, { cyberware: [item('heavy')] })] })).toEqual([]);
    });
    it('counts capacity from perks', () => {
      const levels = [step(2, { perks: ['chrome'] }), step(3), step(4)];
      expect(errorsFor({ levels, cyberwareStages: [stage(1, 4, { cyberware: [item('heavy')] })] })).toEqual([]);
    });
    it('ignores capacity gained after the stage', () => {
      const levels = [step(2), step(3, { perks: ['chrome'] }), step(4)];
      const cyberwareStages = [stage(1, 2, { cyberware: [item('heavy')] }), stage(3, 4)];
      expect(errorsFor({ levels, cyberwareStages })).toContain('Stage 1-2: cyberware uses 40 capacity, 11 available');
    });
  });

  describe('rule 6: stages', () => {
    it('reports a gap', () => {
      expect(errorsFor({ cyberwareStages: [stage(1, 1), stage(3, 4)] })).toContain('Stage 3-4: gap, levels 2 to 2 have no stage');
    });
    it('reports an overlap', () => {
      expect(errorsFor({ cyberwareStages: [stage(1, 3), stage(3, 4)] })).toContain('Stage 3-4: overlaps the previous stage');
    });
    it('reports stages that stop before the cap', () => {
      expect(errorsFor({ cyberwareStages: [stage(1, 2)] })).toContain('Stages: levels 3 to 4 have no stage');
    });
    it('reports stages past the cap', () => {
      expect(errorsFor({ cyberwareStages: [stage(1, 5)] })).toContain('Stages: run past level 4');
    });
    it('reports a stage that starts after it ends', () => {
      expect(errorsFor({ cyberwareStages: [stage(1, 2), stage(4, 3)] })).toContain('Stage 4-3: starts after it ends');
    });
  });

  describe('rule 7: edition', () => {
    it('reports Phantom Liberty perks in a base-game guide', () => {
      const levels = [step(2, { perks: ['spy'] }), step(3), step(4)];
      expect(errorsFor({ levels })).toContain('Level 2: Spy needs Phantom Liberty');
    });
    it('reports relic points in a base-game guide', () => {
      const bonus = [{ type: 'relic' as const, amount: 1, source: 'Terminal' }];
      const levels = [step(2, { bonus }), step(3), step(4)];
      expect(errorsFor({ levels })).toContain('Level 2: relic points need Phantom Liberty');
    });
    it('reports Phantom Liberty cyberware in a base-game guide', () => {
      expect(errorsFor({ cyberwareStages: [stage(1, 4, { cyberware: [item('agent')] })] })).toContain('Stage 1-4: Agent needs Phantom Liberty');
    });
    it('allows all of them in a Phantom Liberty guide', () => {
      const bonus = [{ type: 'relic' as const, amount: 1, source: 'Terminal' }];
      const levels = [step(2, { bonus, perks: ['relic'] }), step(3, { perks: ['spy'] }), step(4), step(5)];
      const cyberwareStages = [stage(1, 5, { cyberware: [item('agent')] })];
      expect(errorsFor({ edition: 'phantom-liberty', levels, cyberwareStages })).toEqual([]);
    });
  });

  describe('rule 8: weapon slots', () => {
    const dual = { ...slot, dualWith: { name: 'Revolver', where: 'Quest', why: 'Good' } };
    const withDoubleTrouble = [step(2, { perks: ['double-trouble'] }), step(3), step(4)];

    it('reports a stage with no weapon slots', () => {
      expect(errorsFor({ cyberwareStages: [stage(1, 4, { weaponSlots: [] })] })).toContain('Stage 1-4: no weapon slots');
    });
    it('reports a repeated slot', () => {
      expect(errorsFor({ cyberwareStages: [stage(1, 4, { weaponSlots: [slot, slot] })] })).toContain('Stage 1-4: weapon slot listed twice');
    });
    it('reports a slot out of range', () => {
      const weaponSlots = [{ ...slot, slot: 4 }];
      expect(errorsFor({ cyberwareStages: [stage(1, 4, { weaponSlots })] })).toContain('Stage 1-4: weapon slot 4 is outside 1 to 3');
    });
    it('reports two dual-wield slots', () => {
      const weaponSlots = [dual, { ...dual, slot: 2 }];
      const errors = errorsFor({ levels: withDoubleTrouble, cyberwareStages: [stage(1, 4, { weaponSlots })] });
      expect(errors).toContain('Stage 1-4: only one weapon slot can dual-wield');
    });
    it('reports dual-wielding without Double Trouble', () => {
      expect(errorsFor({ cyberwareStages: [stage(1, 4, { weaponSlots: [dual] })] })).toContain('Stage 1-4: dual-wielding needs Double Trouble by level 4');
    });
    it('reports dual-wielding before Double Trouble is taken', () => {
      const levels = [step(2), step(3, { perks: ['double-trouble'] }), step(4)];
      const cyberwareStages = [stage(1, 2, { weaponSlots: [dual] }), stage(3, 4)];
      expect(errorsFor({ levels, cyberwareStages })).toContain('Stage 1-2: dual-wielding needs Double Trouble by level 2');
    });
    it('allows dual-wielding once Double Trouble is taken', () => {
      expect(errorsFor({ levels: withDoubleTrouble, cyberwareStages: [stage(1, 4, { weaponSlots: [dual] })] })).toEqual([]);
    });
  });
});
