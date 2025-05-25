import { Recipe } from "../_types/recipe";

export const mockRecipes: Recipe[] = [
  {
    id: "1",
    author: "John Doe",
    name: "Recipe 1",
    image:
      "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/chorizo-mozarella-gnocchi-bake-cropped-9ab73a3.jpg",
    description: "Description 1",
    ingredients: ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
    instructions: ["Instruction 1", "Instruction 2", "Instruction 3"],
    lastUpdated: "2022-01-01",
  },
  {
    id: "2",
    author: "John Doe",
    name: "Recipe 2",
    image: undefined,
    description: "Description 2",
    ingredients: ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
    instructions: ["Instruction 1", "Instruction 2", "Instruction 3"],
    lastUpdated: "2022-01-02",
  },
  {
    id: "3",
    author: "John Doe",
    name: "Recipe 3",
    image:
      "https://images.immediate.co.uk/production/volatile/sites/30/2020/08/chorizo-mozarella-gnocchi-bake-cropped-9ab73a3.jpg",
    description: "Description 3",
    ingredients: ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
    instructions: ["Instruction 1", "Instruction 2", "Instruction 3"],
    lastUpdated: "2022-01-03",
  },
];
