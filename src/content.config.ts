import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { cyberwareSchema, guideSchema, perkSchema, rulesSchema } from './lib/schema';

export const collections = {
  guides: defineCollection({
    loader: glob({ pattern: '*.yaml', base: './src/content/guides' }),
    schema: guideSchema,
  }),
  perks: defineCollection({ loader: file('src/data/perks.yaml'), schema: perkSchema }),
  cyberware: defineCollection({ loader: file('src/data/cyberware.yaml'), schema: cyberwareSchema }),
  rules: defineCollection({ loader: file('src/data/rules.yaml'), schema: rulesSchema }),
};
