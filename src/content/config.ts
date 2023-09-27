// 1. Import utilities from `astro:content`
import { z } from 'astro/zod';
import { defineCollection } from 'astro:content';
// 2. Define your collection(s)

// List of allowed tag names as string
const TagsEnum = z.enum(["plotting", "programming"]);

const blogCollection = defineCollection({ 
    type: 'content',
    schema: z.object({
        title: z.string(),
        tags: z.array(TagsEnum),
    })
 });
// 3. Export a single `collections` object to register your collection(s)
//    This key should match your collection directory name in "src/content"
export const collections = {
  'blog': blogCollection,
};