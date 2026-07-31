export function generatePath(pattern: string, params: Record<string, string>): string {
  return pattern.replace(/:(\w+)/g, (_, key) => {
    const value = params[key];
    if (value === undefined) {
      throw new Error(`Missing param "${key}" for path "${pattern}"`);
    }
    return value;
  });
}

export const routes = {
  groups: {
    base: { path: '/groups', title: 'Groups' },
    create: { path: '/groups/create', title: 'Create Group' },
    edit: { path: '/groups/:id/edit', title: 'Edit Group' },
    view: { path: '/groups/:id', title: 'Group' },
    settings: { path: '/groups/:id/settings', title: 'Group Settings' },
  },
  search: {
    base: { path: '/search', title: 'Search' },
  },
  user: {
    base: { path: '/user', title: 'Account' },
  },
  recipes: {
    base: { path: '/recipes', title: 'Recipes' },
    create: { path: '/recipes/create', title: 'Create Recipe' },
    edit: { path: '/recipes/:id/edit', title: 'Edit Recipe' },
    view: { path: '/recipes/:id', title: 'Recipe' },
  },
};
