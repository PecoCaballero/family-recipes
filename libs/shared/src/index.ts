export type Ingredient = {
  name: string;
  unit?: string;
  quantity: string;
};

export type Recipe = {
  id: string;
  authorId: string;
  author: string;
  name: string;
  image?: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string;
  lastUpdated: string;
  nestedRecipeIds?: string[];
  groupIds: string[];
  savedByIds: string[];
  // Computed properties
  isAuthor?: boolean;
  isSaved?: boolean;
};

export type Group = {
  id: string;
  name: string;
  description: string;
  lastUpdated: string;
  icon: string;
  ownerId: string;
  recipeIds: string[];
};

export type UserSettings = {
  language: 'en' | 'es' | 'fr' | 'pt';
  privacyLevel: 'private' | 'family' | 'public';
  notifications: boolean;
  theme: 'light' | 'dark' | 'auto';
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  settings: UserSettings;
  recipesSaved: string[];
  recipesSharedByOthers: number;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};
