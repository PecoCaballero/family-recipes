import { Router } from 'express';
import { computeRecipeForCurrentUser, currentUserId, getRecipeById, recipes } from '../data';

export const recipeRouter = Router();

recipeRouter.get('/', (req, res) => {
  const query = String(req.query.search || '').trim();

  const filtered = query
    ? recipes.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(query.toLowerCase()) ||
          recipe.description.toLowerCase().includes(query.toLowerCase()) ||
          recipe.ingredients.some((ingredient) =>
            ingredient.name.toLowerCase().includes(query.toLowerCase()),
          ),
      )
    : recipes;

  const items = filtered.map((recipe) => computeRecipeForCurrentUser(recipe));
  return res.status(200).json({ recipes: items });
});

recipeRouter.get('/:id', (req, res) => {
  const recipe = getRecipeById(req.params.id);
  if (!recipe) {
    return res.status(404).json({ error: 'recipe_not_found' });
  }

  return res.status(200).json({ recipe: computeRecipeForCurrentUser(recipe) });
});

recipeRouter.post('/', (req, res) => {
  const { name, description, image, ingredients, instructions, groupIds } = req.body;
  if (!name || !description || !ingredients || !instructions) {
    return res
      .status(400)
      .json({ error: 'name_description_ingredients_and_instructions_required' });
  }

  const newRecipe = {
    id: `recipe-${recipes.length + 1}`,
    authorId: currentUserId,
    author: 'John Doe',
    name,
    image,
    description,
    ingredients,
    instructions,
    lastUpdated: new Date().toISOString(),
    nestedRecipeIds: [],
    groupIds: Array.isArray(groupIds) ? groupIds : [],
    savedByIds: [],
  };

  recipes.push(newRecipe);
  return res.status(201).json({ recipe: computeRecipeForCurrentUser(newRecipe) });
});

recipeRouter.patch('/:id', (req, res) => {
  const recipe = getRecipeById(req.params.id);
  if (!recipe) {
    return res.status(404).json({ error: 'recipe_not_found' });
  }

  const { name, description, image, ingredients, instructions, groupIds } = req.body;
  recipe.name = name ?? recipe.name;
  recipe.description = description ?? recipe.description;
  recipe.image = image ?? recipe.image;
  recipe.ingredients = ingredients ?? recipe.ingredients;
  recipe.instructions = instructions ?? recipe.instructions;
  recipe.groupIds = Array.isArray(groupIds) ? groupIds : recipe.groupIds;
  recipe.lastUpdated = new Date().toISOString();

  return res.status(200).json({ recipe: computeRecipeForCurrentUser(recipe) });
});

recipeRouter.delete('/:id', (req, res) => {
  const index = recipes.findIndex((recipe) => recipe.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'recipe_not_found' });
  }

  recipes.splice(index, 1);
  return res.status(204).send();
});

recipeRouter.post('/:id/save', (req, res) => {
  const recipe = getRecipeById(req.params.id);
  if (!recipe) {
    return res.status(404).json({ error: 'recipe_not_found' });
  }

  if (!recipe.savedByIds.includes(currentUserId)) {
    recipe.savedByIds.push(currentUserId);
  }

  return res.status(200).json({ recipe: computeRecipeForCurrentUser(recipe) });
});

recipeRouter.post('/:id/unsave', (req, res) => {
  const recipe = getRecipeById(req.params.id);
  if (!recipe) {
    return res.status(404).json({ error: 'recipe_not_found' });
  }

  recipe.savedByIds = recipe.savedByIds.filter((userId) => userId !== currentUserId);
  return res.status(200).json({ recipe: computeRecipeForCurrentUser(recipe) });
});

recipeRouter.post('/:id/groups', (req, res) => {
  const recipe = getRecipeById(req.params.id);
  const { groupId } = req.body;
  if (!recipe) {
    return res.status(404).json({ error: 'recipe_not_found' });
  }
  if (!groupId) {
    return res.status(400).json({ error: 'group_id_required' });
  }

  if (!recipe.groupIds.includes(groupId)) {
    recipe.groupIds.push(groupId);
  }

  return res.status(200).json({ recipe: computeRecipeForCurrentUser(recipe) });
});
