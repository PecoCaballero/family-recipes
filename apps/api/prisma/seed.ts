import 'dotenv/config';
import bcrypt from 'bcrypt';
import { prisma } from '../src/lib/prisma';

const PASSWORD = 'password123';
const SALT_ROUNDS = 12;

const SEED_USERS = [
  { name: 'Alice Johnson', email: 'alice@example.com' },
  { name: 'Bob Smith', email: 'bob@example.com' },
  { name: 'Carol Davis', email: 'carol@example.com' },
  { name: 'Dave Wilson', email: 'dave@example.com' },
  { name: 'Eve Brown', email: 'eve@example.com' },
];

type SeedRecipe = {
  name: string;
  authorEmail: string;
  description: string;
  instructions: string;
  visibility: string;
  ingredients: { name: string; unit?: string; quantity: string }[];
};

const SEED_RECIPES: SeedRecipe[] = [
  {
    name: 'Classic Spaghetti Bolognese',
    authorEmail: 'alice@example.com',
    description: 'A rich, slow-simmered meat sauce over spaghetti.',
    visibility: 'public',
    instructions: '1. Brown the beef in a large pot.\n2. Add onion, garlic, and tomatoes, then simmer for 45 minutes.\n3. Cook spaghetti and toss with the sauce.',
    ingredients: [
      { name: 'Ground beef', quantity: '500', unit: 'g' },
      { name: 'Spaghetti', quantity: '400', unit: 'g' },
      { name: 'Crushed tomatoes', quantity: '800', unit: 'g' },
      { name: 'Onion', quantity: '1' },
      { name: 'Garlic', quantity: '3', unit: 'cloves' },
    ],
  },
  {
    name: 'Chicken Alfredo Pasta',
    authorEmail: 'alice@example.com',
    description: 'Creamy parmesan sauce with seared chicken and fettuccine.',
    visibility: 'private',
    instructions: '1. Season and sear the chicken until cooked through.\n2. Melt butter, add cream and parmesan to make the sauce.\n3. Toss cooked fettuccine with sauce and sliced chicken.',
    ingredients: [
      { name: 'Chicken breast', quantity: '2' },
      { name: 'Fettuccine', quantity: '350', unit: 'g' },
      { name: 'Heavy cream', quantity: '250', unit: 'ml' },
      { name: 'Parmesan', quantity: '100', unit: 'g' },
      { name: 'Butter', quantity: '50', unit: 'g' },
    ],
  },
  {
    name: 'Beef Tacos',
    authorEmail: 'bob@example.com',
    description: 'Seasoned ground beef in warm tortillas with fresh toppings.',
    visibility: 'public',
    instructions: '1. Brown beef with taco seasoning.\n2. Warm the tortillas.\n3. Fill tortillas with beef, lettuce, cheese, and salsa.',
    ingredients: [
      { name: 'Ground beef', quantity: '450', unit: 'g' },
      { name: 'Taco shells', quantity: '8' },
      { name: 'Cheddar cheese', quantity: '100', unit: 'g' },
      { name: 'Lettuce', quantity: '1', unit: 'head' },
      { name: 'Salsa', quantity: '200', unit: 'g' },
      { name: 'Taco seasoning', quantity: '2', unit: 'tbsp' },
    ],
  },
  {
    name: 'Vegetable Stir Fry',
    authorEmail: 'bob@example.com',
    description: 'Quick mix of crisp vegetables in a savory sauce.',
    visibility: 'private',
    instructions: '1. Heat oil in a wok over high heat.\n2. Stir-fry vegetables until tender-crisp.\n3. Add soy sauce and sesame oil, then serve over rice.',
    ingredients: [
      { name: 'Broccoli', quantity: '200', unit: 'g' },
      { name: 'Carrot', quantity: '2' },
      { name: 'Bell pepper', quantity: '1' },
      { name: 'Soy sauce', quantity: '3', unit: 'tbsp' },
      { name: 'Sesame oil', quantity: '1', unit: 'tsp' },
      { name: 'Rice', quantity: '300', unit: 'g' },
    ],
  },
  {
    name: 'Margherita Pizza',
    authorEmail: 'carol@example.com',
    description: 'Thin crust with tomato, fresh mozzarella, and basil.',
    visibility: 'public',
    instructions: '1. Roll out the dough and spread tomato sauce.\n2. Top with mozzarella slices and bake at high heat.\n3. Garnish with fresh basil before serving.',
    ingredients: [
      { name: 'Pizza dough', quantity: '1', unit: 'ball' },
      { name: 'Tomato sauce', quantity: '150', unit: 'g' },
      { name: 'Fresh mozzarella', quantity: '200', unit: 'g' },
      { name: 'Basil', quantity: '10', unit: 'leaves' },
      { name: 'Olive oil', quantity: '1', unit: 'tbsp' },
    ],
  },
  {
    name: 'Chocolate Chip Cookies',
    authorEmail: 'carol@example.com',
    description: 'Soft, chewy cookies loaded with chocolate chips.',
    visibility: 'private',
    instructions: '1. Cream butter and sugars.\n2. Mix in eggs, flour, and chocolate chips.\n3. Scoop onto a tray and bake until golden.',
    ingredients: [
      { name: 'Butter', quantity: '200', unit: 'g' },
      { name: 'Brown sugar', quantity: '150', unit: 'g' },
      { name: 'Flour', quantity: '300', unit: 'g' },
      { name: 'Chocolate chips', quantity: '250', unit: 'g' },
      { name: 'Eggs', quantity: '2' },
      { name: 'Baking soda', quantity: '1', unit: 'tsp' },
    ],
  },
  {
    name: 'Banana Bread',
    authorEmail: 'carol@example.com',
    description: 'Moist loaf packed with ripe bananas and walnuts.',
    visibility: 'public',
    instructions: '1. Mash bananas and mix with melted butter and sugar.\n2. Fold in flour and walnuts.\n3. Bake in a loaf pan until a toothpick comes out clean.',
    ingredients: [
      { name: 'Ripe bananas', quantity: '3' },
      { name: 'Flour', quantity: '250', unit: 'g' },
      { name: 'Sugar', quantity: '150', unit: 'g' },
      { name: 'Butter', quantity: '100', unit: 'g' },
      { name: 'Walnuts', quantity: '100', unit: 'g' },
      { name: 'Baking powder', quantity: '1', unit: 'tsp' },
    ],
  },
  {
    name: 'Blueberry Muffins',
    authorEmail: 'carol@example.com',
    description: 'Bakery-style muffins bursting with blueberries.',
    visibility: 'private',
    instructions: '1. Whisk dry ingredients together.\n2. Mix wet ingredients and fold in blueberries.\n3. Divide into a muffin tin and bake until risen.',
    ingredients: [
      { name: 'Flour', quantity: '280', unit: 'g' },
      { name: 'Blueberries', quantity: '200', unit: 'g' },
      { name: 'Milk', quantity: '180', unit: 'ml' },
      { name: 'Sugar', quantity: '120', unit: 'g' },
      { name: 'Eggs', quantity: '2' },
    ],
  },
  {
    name: 'Caesar Salad',
    authorEmail: 'dave@example.com',
    description: 'Crisp romaine with creamy dressing, croutons, and parmesan.',
    visibility: 'public',
    instructions: '1. Whisk together dressing ingredients.\n2. Toss romaine with dressing.\n3. Top with croutons and shaved parmesan.',
    ingredients: [
      { name: 'Romaine lettuce', quantity: '2', unit: 'heads' },
      { name: 'Croutons', quantity: '100', unit: 'g' },
      { name: 'Parmesan', quantity: '50', unit: 'g' },
      { name: 'Mayonnaise', quantity: '3', unit: 'tbsp' },
      { name: 'Lemon juice', quantity: '1', unit: 'tbsp' },
    ],
  },
  {
    name: 'Grilled Salmon',
    authorEmail: 'dave@example.com',
    description: 'Flaky salmon fillets with a honey-lemon glaze.',
    visibility: 'private',
    instructions: '1. Whisk honey, lemon, and soy sauce for the glaze.\n2. Grill salmon skin-side down until flaky.\n3. Brush with glaze and serve.',
    ingredients: [
      { name: 'Salmon fillets', quantity: '4' },
      { name: 'Honey', quantity: '2', unit: 'tbsp' },
      { name: 'Lemon', quantity: '1' },
      { name: 'Soy sauce', quantity: '2', unit: 'tbsp' },
      { name: 'Garlic', quantity: '2', unit: 'cloves' },
    ],
  },
  {
    name: 'French Onion Soup',
    authorEmail: 'eve@example.com',
    description: 'Caramelized onions in beef broth topped with melted gruyere.',
    visibility: 'public',
    instructions: '1. Slowly caramelize sliced onions in butter.\n2. Add broth and simmer.\n3. Ladle into bowls, top with bread and cheese, and broil.',
    ingredients: [
      { name: 'Onions', quantity: '5' },
      { name: 'Beef broth', quantity: '1', unit: 'l' },
      { name: 'Gruyere', quantity: '150', unit: 'g' },
      { name: 'Baguette', quantity: '1' },
      { name: 'Butter', quantity: '60', unit: 'g' },
    ],
  },
  {
    name: 'Apple Pie',
    authorEmail: 'eve@example.com',
    description: 'Flaky crust filled with spiced apples.',
    visibility: 'private',
    instructions: '1. Roll out pie dough and fill with spiced apples.\n2. Cover with a top crust and vent.\n3. Bake until golden and bubbling.',
    ingredients: [
      { name: 'Pie dough', quantity: '2', unit: 'crusts' },
      { name: 'Apples', quantity: '6' },
      { name: 'Sugar', quantity: '150', unit: 'g' },
      { name: 'Cinnamon', quantity: '1', unit: 'tsp' },
      { name: 'Butter', quantity: '30', unit: 'g' },
    ],
  },
  {
    name: 'Sourdough Bread',
    authorEmail: 'alice@example.com',
    description: 'Crusty artisan loaf with a tangy sourdough crumb.',
    visibility: 'public',
    instructions: '1. Mix starter, flour, water, and salt.\n2. Stretch and fold over several hours.\n3. Shape, proof, and bake in a dutch oven.',
    ingredients: [
      { name: 'Bread flour', quantity: '500', unit: 'g' },
      { name: 'Water', quantity: '350', unit: 'ml' },
      { name: 'Sourdough starter', quantity: '100', unit: 'g' },
      { name: 'Salt', quantity: '10', unit: 'g' },
    ],
  },
  {
    name: 'Buttermilk Pancakes',
    authorEmail: 'bob@example.com',
    description: 'Light and fluffy pancakes with maple syrup.',
    visibility: 'private',
    instructions: '1. Whisk buttermilk, eggs, and melted butter.\n2. Fold in dry ingredients until just combined.\n3. Cook on a griddle and serve warm.',
    ingredients: [
      { name: 'Buttermilk', quantity: '300', unit: 'ml' },
      { name: 'Flour', quantity: '200', unit: 'g' },
      { name: 'Eggs', quantity: '2' },
      { name: 'Butter', quantity: '40', unit: 'g' },
      { name: 'Maple syrup', quantity: '100', unit: 'ml' },
    ],
  },
  {
    name: 'Roast Chicken',
    authorEmail: 'dave@example.com',
    description: 'Golden roasted whole chicken with herbs and lemon.',
    visibility: 'public',
    instructions: '1. Rub chicken with oil, herbs, and lemon.\n2. Roast until the skin is crisp and juices run clear.\n3. Rest before carving.',
    ingredients: [
      { name: 'Whole chicken', quantity: '1' },
      { name: 'Lemon', quantity: '1' },
      { name: 'Rosemary', quantity: '2', unit: 'sprigs' },
      { name: 'Garlic', quantity: '4', unit: 'cloves' },
      { name: 'Olive oil', quantity: '2', unit: 'tbsp' },
    ],
  },
];

const SEED_GROUPS = [
  {
    name: 'Sunday Dinner Club',
    description: 'Hearty weekend meals shared with family.',
    icon: '🍽️',
    adminEmails: ['alice@example.com', 'bob@example.com'],
    memberEmails: ['alice@example.com', 'bob@example.com', 'carol@example.com'],
  },
  {
    name: 'Baking Enthusiasts',
    description: 'Bread, cakes, and everything from the oven.',
    icon: '🧁',
    adminEmails: ['alice@example.com'],
    memberEmails: ['alice@example.com', 'dave@example.com', 'eve@example.com'],
  },
  {
    name: 'Quick Weeknight Meals',
    description: 'Fast dinners for busy evenings.',
    icon: '⚡',
    adminEmails: ['bob@example.com'],
    memberEmails: ['bob@example.com', 'dave@example.com'],
  },
];

async function upsertUser(name: string, email: string, passwordHash: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;
  return prisma.user.create({
    data: { name, email, passwordHash },
  });
}

async function upsertRecipe(recipe: SeedRecipe, author: { id: string; name: string }) {
  const existing = await prisma.recipe.findFirst({ where: { name: recipe.name } });
  if (existing) return existing;
  return prisma.recipe.create({
    data: {
      authorId: author.id,
      author: author.name,
      name: recipe.name,
      description: recipe.description,
      instructions: recipe.instructions,
      visibility: recipe.visibility,
      ingredients: {
        create: recipe.ingredients,
      },
    },
  });
}

async function upsertGroup(
  name: string,
  description: string,
  icon: string,
  adminIds: string[],
  memberIds: string[],
) {
  const existing = await prisma.group.findFirst({ where: { name } });
  const group =
    existing ??
    (await prisma.group.create({
      data: { name, description, icon, lastUpdated: new Date() },
    }));

  for (const userId of memberIds) {
    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: group.id, userId } },
      create: { groupId: group.id, userId },
      update: {},
    });
  }
  for (const userId of adminIds) {
    await prisma.groupAdmin.upsert({
      where: { groupId_userId: { groupId: group.id, userId } },
      create: { groupId: group.id, userId },
      update: {},
    });
  }

  return group;
}

async function shareRecipe(groupId: string, recipeId: string) {
  await prisma.recipeGroup.upsert({
    where: { recipeId_groupId: { recipeId, groupId } },
    create: { recipeId, groupId },
    update: {},
  });
}

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, SALT_ROUNDS);

  // Users
  const userMap: Record<string, { id: string; name: string }> = {};
  for (const u of SEED_USERS) {
    userMap[u.email] = await upsertUser(u.name, u.email, passwordHash);
  }

  // Recipes
  const recipeMap: Record<string, { id: string }> = {};
  for (const recipe of SEED_RECIPES) {
    const author = userMap[recipe.authorEmail];
    recipeMap[recipe.name] = await upsertRecipe(recipe, author);
  }

  // Groups
  const groups = [];
  for (const g of SEED_GROUPS) {
    const adminIds = g.adminEmails.map((email) => userMap[email].id);
    const memberIds = g.memberEmails.map((email) => userMap[email].id);
    groups.push(await upsertGroup(g.name, g.description, g.icon, adminIds, memberIds));
  }

  // Share some recipes to groups
  const [sundayDinner, bakingEnthusiasts, weeknight] = groups;

  await shareRecipe(sundayDinner.id, recipeMap['Classic Spaghetti Bolognese'].id);
  await shareRecipe(sundayDinner.id, recipeMap['Roast Chicken'].id);
  await shareRecipe(sundayDinner.id, recipeMap['French Onion Soup'].id);

  await shareRecipe(bakingEnthusiasts.id, recipeMap['Chocolate Chip Cookies'].id);
  await shareRecipe(bakingEnthusiasts.id, recipeMap['Banana Bread'].id);
  await shareRecipe(bakingEnthusiasts.id, recipeMap['Sourdough Bread'].id);

  await shareRecipe(weeknight.id, recipeMap['Vegetable Stir Fry'].id);
  await shareRecipe(weeknight.id, recipeMap['Beef Tacos'].id);

  console.log('Seed complete');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
