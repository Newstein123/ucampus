import { z } from 'zod';

export const ideaSchema = z.object({
    thumbnail: z.any().optional(),
    title: z.string().min(1, 'Title is required'),
    problem: z.string().min(1, 'Problem is required'),
    thought: z.string().min(1, 'Thought is required'),
    why_it_matters: z.string().min(1, 'Why it matters is required'),
    tags: z.array(z.string()).optional(),
    is_public: z.boolean(),
});

export type IdeaForm = z.infer<typeof ideaSchema>;

// Project schema uses the full 3-step form
export const projectSchema = z.object({
    thumbnail: z.any().optional(),
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    problem: z.string().min(1, 'Problem is required'),
    solution: z.string().min(1, 'Solution is required'),
    impact: z.string().min(1, 'Impact is required'),
    resources: z.string().min(1, 'Resources needed is required'),
    references: z.array(z.string().url('Please enter a valid URL')).optional(),
    attachments: z.array(z.any()).optional(),
    tags: z.array(z.string()).optional(),
    allow_collab: z.boolean().optional(),
    is_public: z.boolean(),
});

export type ProjectForm = z.infer<typeof projectSchema>;
