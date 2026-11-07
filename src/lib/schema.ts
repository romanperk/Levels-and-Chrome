import { z } from 'astro/zod';

// Astro keeps parsed content cached and does not notice changes to this file.
// After editing a schema, restart the dev server. If a guide still reports errors that do not match its file, change that file so it is parsed again.

export const attributeNames = ['body', 'reflexes', 'technical', 'intelligence', 'cool'] as const;
const attribute = z.enum(attributeNames);
const edition = z.enum(['base-game', 'phantom-liberty']);
const reason = { where: z.string(), why: z.string() };

export const guideSchema = z.object({
  title: z.string(),
  edition,
  patch: z.string(),
  summary: z.string(),
  // A draft only has to be complete up to its last listed level.
  draft: z.boolean().default(false),
  // Set once someone has played the whole route. Until then the guide is labeled as untested.
  playtested: z.boolean().default(false),
  startingAttributes: z.object({
    body: z.number().int(),
    reflexes: z.number().int(),
    technical: z.number().int(),
    intelligence: z.number().int(),
    cool: z.number().int(),
  }),
  levels: z.array(
    z.object({
      level: z.number().int(),
      attributes: z.array(attribute).default([]),
      perks: z.array(z.string()).default([]),
      bonus: z
        .array(
          z.object({
            type: z.enum(['perk', 'attribute', 'relic', 'capacity']),
            amount: z.number().int().positive(),
            source: z.string(),
          }),
        )
        .default([]),
      note: z.string().optional(),
    }),
  ),
  cyberwareStages: z.array(
    z.object({
      from: z.number().int(),
      to: z.number().int(),
      cyberware: z
        .array(z.object({ id: z.string(), tier: z.number().int().min(1).max(5), ...reason }))
        .default([]),
      weaponSlots: z.array(
        z.object({
          slot: z.number().int(),
          name: z.string(),
          ...reason,
          // Second gun held at once, once Double Trouble is taken.
          dualWith: z.object({ name: z.string(), ...reason }).optional(),
        }),
      ),
      gear: z.array(z.object({ name: z.string(), ...reason })).default([]),
    }),
  ),
});

export const perkSchema = z.object({
  name: z.string(),
  tree: z.union([attribute, z.literal('relic')]),
  requires: z.number().int().default(0),
  prerequisite: z.string().optional(),
  phantomLiberty: z.boolean().default(false),
  capacityBonus: z.number().int().default(0),
  cost: z.number().int().default(1),
});

export const cyberwareSchema = z.object({
  name: z.string(),
  slot: z.string(),
  // Capacity cost by tier. Left out while unknown, and the rule check then skips the item's cost.
  capacity: z.record(z.string(), z.number().int()).optional(),
  phantomLiberty: z.boolean().default(false),
});

const editionRules = z.object({
  levelCap: z.number().int(),
  attributeTotal: z.number().int(),
  perkTotal: z.number().int(),
});

export const rulesSchema = z.object({
  patch: z.string(),
  editions: z.object({ 'base-game': editionRules, 'phantom-liberty': editionRules }),
  attributes: z.object({
    starting: z.number().int(),
    creationPoints: z.number().int(),
    creationMaximum: z.number().int(),
    maximum: z.number().int(),
  }),
  pointsPerLevel: z.object({ attribute: z.number().int(), perk: z.number().int() }),
  weaponSlots: z.number().int(),
  capacity: z.object({ starting: z.number().int(), perLevel: z.number().int() }),
  tierFromLevel: z.record(z.string(), z.number().int()),
});

export type Guide = z.infer<typeof guideSchema>;
export type Perk = z.infer<typeof perkSchema>;
export type Cyberware = z.infer<typeof cyberwareSchema>;
export type Rules = z.infer<typeof rulesSchema>;
export type AttributeName = (typeof attributeNames)[number];
