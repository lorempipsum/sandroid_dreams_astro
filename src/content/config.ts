// 1. Import utilities from `astro:content`
import { z } from 'astro/zod';
import { defineCollection } from 'astro:content';
// 2. Define your collection(s)

// List of allowed tag names as string
const TagsEnum = z.enum([
  'plotting',
  'programming',
  'photography',
  'art',
  'blog',
  'gaming',
  'audio',
]);

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    tags: z.array(TagsEnum),
    date: z.string(),
  }),
});
const photoCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    tags: z.array(TagsEnum),
    date: z.string(),
  }),
});

const plottingCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    tags: z.array(TagsEnum),
    date: z.string(),
  }),
});

// 3. Export a single `collections` object to register your collection(s)
//    This key should match your collection directory name in "src/content"
export const collections = {
  blog: blogCollection,
  photography: photoCollection,
  plotting: plottingCollection,
};
