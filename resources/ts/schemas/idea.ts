import { z } from 'zod';

export const ideaSchema = z.object({
  thumbnail: z.any().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  problem: z.string().min(1, 'Problem is required'),
  solution: z.string().min(1, 'Solution is required'),
  impact: z.string().min(1, 'Impact is required'),
  resources: z.string().min(1, 'Resources needed is required'),
  attachments: z.array(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  allowContributions: z.boolean(),
  publicVisibility: z.boolean(),
});

export type IdeaForm = z.infer<typeof ideaSchema>; 