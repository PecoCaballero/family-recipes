export const routes = {
  groups: {
    base: { path: "/groups", title: "Groups" },
    create: { path: "/groups/create", title: "Create Group" },
    edit: { path: "/groups/:id/edit", title: "Edit Group" },
    view: { path: "/groups/:id", title: "Group" },
  },
  search: {
    base: { path: "/search", title: "Search" },
  },
  settings: {
    base: { path: "/settings", title: "Settings" },
  },
  recipes: {
    base: { path: "/recipes", title: "Recipes" },
    create: { path: "/recipes/create", title: "Create Recipe" },
    edit: { path: "/recipes/:id/edit", title: "Edit Recipe" },
    view: { path: "/recipes/:id", title: "Recipe" },
  },
};
