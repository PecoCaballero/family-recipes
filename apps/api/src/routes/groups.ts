import { Router } from 'express';
import { currentUserId, getGroupById, getRecipeById, groups } from '../data';

export const groupRouter = Router();

groupRouter.get('/', (req, res) => {
  const query = String(req.query.search || '').trim();
  const filtered = query
    ? groups.filter((group) => group.name.toLowerCase().includes(query.toLowerCase()))
    : groups;

  return res.status(200).json({ groups: filtered });
});

groupRouter.get('/:id', (req, res) => {
  const group = getGroupById(req.params.id);
  if (!group) {
    return res.status(404).json({ error: 'group_not_found' });
  }

  const recipes = group.recipeIds.map((recipeId) => getRecipeById(recipeId)).filter(Boolean);
  return res.status(200).json({ group, recipes, isOwner: group.ownerId === currentUserId });
});

groupRouter.post('/', (req, res) => {
  const { name, description, icon } = req.body;
  if (!name || !description) {
    return res.status(400).json({ error: 'name_and_description_required' });
  }

  const newGroup = {
    id: `group-${groups.length + 1}`,
    name,
    description,
    icon: icon || 'https://cf.ltkcdn.net/family/images/std/200821-800x533r1-family.jpg',
    lastUpdated: new Date().toISOString(),
    ownerId: currentUserId,
    recipeIds: [],
  };

  groups.push(newGroup);
  return res.status(201).json(newGroup);
});

groupRouter.patch('/:id', (req, res) => {
  const group = getGroupById(req.params.id);
  if (!group) {
    return res.status(404).json({ error: 'group_not_found' });
  }

  const { name, description, icon } = req.body;
  group.name = name ?? group.name;
  group.description = description ?? group.description;
  group.icon = icon ?? group.icon;
  group.lastUpdated = new Date().toISOString();

  return res.status(200).json(group);
});

groupRouter.post('/:id/recipes', (req, res) => {
  const group = getGroupById(req.params.id);
  const { recipeId } = req.body;
  if (!group) {
    return res.status(404).json({ error: 'group_not_found' });
  }
  if (!recipeId) {
    return res.status(400).json({ error: 'recipe_id_required' });
  }

  const recipe = getRecipeById(recipeId);
  if (!recipe) {
    return res.status(404).json({ error: 'recipe_not_found' });
  }

  if (!group.recipeIds.includes(recipeId)) {
    group.recipeIds.push(recipeId);
    group.lastUpdated = new Date().toISOString();
  }

  if (!recipe.groupIds.includes(group.id)) {
    recipe.groupIds.push(group.id);
  }

  return res.status(200).json({ group, recipe });
});
