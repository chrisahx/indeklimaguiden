import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        seoTitle: z.string().optional(),
        description: z.string(),
        seoDescription: z.string().optional(),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        category: z.enum(['aircondition', 'varmepumper', 'indeklima', 'affugter', 'luftrenser']),
        articleType: z.enum(['guide', 'anmeldelse']).default('guide'),
        slug: z.string(),
        tags: z.array(z.string()).default([]),
        cover: image().optional(),
        coverAlt: z.string().optional(),
        draft: z.boolean(),
        featured: z.boolean().default(false),
        commercialDisclosure: z.boolean().default(false),
        schemaType: z.enum(['Article', 'Review', 'HowTo']).default('Article'),
        faq: z
          .array(
            z.object({
              question: z.string(),
              answer: z.string(),
            }),
          )
          .default([]),
      })
      .refine((data) => !data.cover || data.coverAlt, {
        message: 'coverAlt is required when cover is set',
        path: ['coverAlt'],
      }),
});

export const collections = { articles };
