import type { Group, Recipe, User } from '@family-recipe/shared';

export const currentUserId = 'user-1';

export const users: User[] = [
  {
    id: currentUserId,
    name: 'John Doe',
    email: 'john@example.com',
    avatar: undefined,
    settings: {
      language: 'en',
      privacyLevel: 'private',
      notifications: true,
      theme: 'auto',
    },
    recipesSaved: ['2', '3'],
    recipesSharedByOthers: 12,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const groups: Group[] = [
  {
    id: '1',
    name: 'Family Recipes',
    description: 'Our favorite family recipes passed down through generations',
    lastUpdated: new Date('2025-05-20').toISOString(),
    icon: 'https://cf.ltkcdn.net/family/images/std/200821-800x533r1-family.jpg',
    ownerId: currentUserId,
    recipeIds: ['1'],
  },
  {
    id: '2',
    name: 'Holiday Specials',
    description: 'Recipes for special occasions and holidays',
    lastUpdated: new Date('2025-05-15').toISOString(),
    icon: 'https://cf.ltkcdn.net/family/images/std/200821-800x533r1-family.jpg',
    ownerId: currentUserId,
    recipeIds: ['1', '3'],
  },
  {
    id: '3',
    name: 'Weeknight Dinners',
    description: 'Quick and easy recipes for busy weeknights',
    lastUpdated: new Date('2025-05-22').toISOString(),
    icon: 'https://cf.ltkcdn.net/family/images/std/200821-800x533r1-family.jpg',
    ownerId: currentUserId,
    recipeIds: ['2'],
  },
  {
    id: '4',
    name: 'Breakfast Favorites',
    description: 'Delicious breakfast recipes to start your day',
    lastUpdated: new Date('2025-05-18').toISOString(),
    icon: 'https://cf.ltkcdn.net/family/images/std/200821-800x533r1-family.jpg',
    ownerId: currentUserId,
    recipeIds: [],
  },
];

export const recipes: Recipe[] = [
  {
    id: '1',
    authorId: currentUserId,
    author: 'John Doe',
    name: 'Recipe 1',
    image:
      'https://images.immediate.co.uk/production/volatile/sites/30/2020/08/chorizo-mozarella-gnocchi-bake-cropped-9ab73a3.jpg',
    description: 'Description 1',
    ingredients: [
      { name: 'Ingredient 1', unit: 'spoon', quantity: '1' },
      { name: 'Ingredient 2', unit: 'cup', quantity: '2' },
      { name: 'Ingredient 3', quantity: '5' },
    ],
    instructions:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s...",
    lastUpdated: '2022-01-01',
    nestedRecipeIds: ['2', '3'],
    groupIds: ['1', '2'],
    savedByIds: ['1'],
  },
  {
    id: '2',
    authorId: 'user-2',
    author: 'Jane Doe',
    name: 'Recipe 2',
    image: undefined,
    description: 'Description 2',
    ingredients: [
      { name: 'Ingredient 1', unit: 'spoon', quantity: '1' },
      { name: 'Ingredient 2', unit: 'cup', quantity: '2' },
      { name: 'Ingredient 3', quantity: '5' },
    ],
    instructions:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s...",
    lastUpdated: '2022-01-02',
    groupIds: ['3'],
    savedByIds: ['1'],
  },
  {
    id: '3',
    authorId: 'user-3',
    author: 'Marta Smith',
    name: 'Recipe 3',
    image:
      'https://images.immediate.co.uk/production/volatile/sites/30/2020/08/chorizo-mozarella-gnocchi-bake-cropped-9ab73a3.jpg',
    description: 'Description 3',
    ingredients: [
      { name: 'Ingredient 1', unit: 'spoon', quantity: '1' },
      { name: 'Ingredient 2', unit: 'cup', quantity: '2' },
      { name: 'Ingredient 3', quantity: '5' },
    ],
    instructions:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s...",
    lastUpdated: '2022-01-03',
    groupIds: ['2'],
    savedByIds: ['1'],
  },
];

export function getUser() {
  return users.find((user) => user.id === currentUserId);
}

export function getRecipeById(id: string) {
  return recipes.find((recipe) => recipe.id === id);
}

export function getGroupById(id: string) {
  return groups.find((group) => group.id === id);
}

export function computeRecipeForCurrentUser(recipe: Recipe) {
  return {
    ...recipe,
    isAuthor: recipe.authorId === currentUserId,
    isSaved: recipe.savedByIds.includes(currentUserId),
  };
}

export function searchGroups(query?: string) {
  if (!query) return groups;
  const normalized = query.toLowerCase();
  return groups.filter((group) => group.name.toLowerCase().includes(normalized));
}

export function searchRecipes(query?: string) {
  if (!query) return recipes;
  const normalized = query?.toLowerCase() ?? '';
  return recipes.filter(
    (recipe) =>
      recipe.name.toLowerCase().includes(normalized) ||
      recipe.description.toLowerCase().includes(normalized) ||
      recipe.ingredients.some((ingredient) => ingredient.name.toLowerCase().includes(normalized)),
  );
}
