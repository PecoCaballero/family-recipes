import { z } from 'zod';

export const ingredientSchema = z.object({
  name: z.string(),
  unit: z.string().optional(),
  quantity: z.string(),
});
export type Ingredient = z.infer<typeof ingredientSchema>;

export const prismaIngredientSchema = z.object({
  name: z.string(),
  unit: z.string().nullable(),
  quantity: z.string(),
});
export type PrismaIngredient = z.infer<typeof prismaIngredientSchema>;

export const userSettingsSchema = z.object({
  language: z.enum(['en', 'es', 'fr', 'pt']),
  privacyLevel: z.enum(['private', 'family', 'public']),
  notifications: z.boolean(),
  theme: z.enum(['light', 'dark', 'auto']),
});
export type UserSettings = z.infer<typeof userSettingsSchema>;

export const userSettingsUpdateSchema = z.object({
  language: z.enum(['en', 'es', 'fr', 'pt']).optional(),
  privacyLevel: z.enum(['private', 'family', 'public']).optional(),
  notifications: z.boolean().optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
});
export type UserSettingsUpdate = z.infer<typeof userSettingsUpdateSchema>;

export const recipeSchema = z.object({
  id: z.string(),
  authorId: z.string(),
  author: z.string(),
  name: z.string(),
  image: z.string().optional(),
  description: z.string(),
  ingredients: z.array(ingredientSchema),
  instructions: z.string(),
  lastUpdated: z.string(),
  nestedRecipeIds: z.array(z.string()).optional(),
  groupIds: z.array(z.string()),
  savedByIds: z.array(z.string()),
  isAuthor: z.boolean().optional(),
  isSaved: z.boolean().optional(),
});
export type Recipe = z.infer<typeof recipeSchema>;

export const createRecipeInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  image: z.string().optional(),
  ingredients: z.array(ingredientSchema),
  instructions: z.string().min(1),
  parentRecipeId: z.string().optional(),
});
export type CreateRecipeInput = z.infer<typeof createRecipeInputSchema>;

export const updateRecipeInputSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  ingredients: z.array(ingredientSchema).optional(),
  instructions: z.string().optional(),
  parentRecipeId: z.string().optional(),
});
export type UpdateRecipeInput = z.infer<typeof updateRecipeInputSchema>;

export const groupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  lastUpdated: z.string(),
  icon: z.string().nullable(),
  ownerId: z.string(),
  recipeIds: z.array(z.string()),
});
export type Group = z.infer<typeof groupSchema>;

export const createGroupInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().optional().nullable(),
});
export type CreateGroupInput = z.infer<typeof createGroupInputSchema>;

export const updateGroupInputSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional().nullable(),
});
export type UpdateGroupInput = z.infer<typeof updateGroupInputSchema>;

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().optional(),
  settings: userSettingsSchema,
  recipesSaved: z.array(z.string()),
  recipesSharedByOthers: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type User = z.infer<typeof userSchema>;

export const authResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: userSchema,
});
export type AuthResponse = z.infer<typeof authResponseSchema>;

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type LoginInput = z.infer<typeof loginInputSchema>;

export const registerInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});
export type RegisterInput = z.infer<typeof registerInputSchema>;

export const tokenPairSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type TokenPair = z.infer<typeof tokenPairSchema>;
