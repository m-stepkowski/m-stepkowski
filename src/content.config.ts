import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
			// The URL search engines / cross-posted copies (dev.to, Hashnode, ...)
			// should treat as the source of truth for this post.
			canonicalURL: z.string().url().optional(),
			// Position within a numbered series, e.g. the kubemend posts.
			// Independent of pubDate so reading order stays explicit even if
			// posts are backdated or published out of order.
			part: z.number().int().positive().optional(),
		}),
});

export const collections = { blog };
