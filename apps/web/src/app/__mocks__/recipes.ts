import { Recipe } from '../_types/recipe';

export const mockRecipes: Recipe[] = [
  {
    id: '1',
    author: 'John Doe',
    isSaved: true,
    isAuthor: true,
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
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    lastUpdated: '2022-01-01',
    nestedRecipes: [
      {
        id: '2',
        author: 'John Doe',
        isSaved: true,
        isAuthor: true,
        name: 'Recipe 2',
        image: undefined,
        description: 'Description 2',
        ingredients: [
          { name: 'Ingredient 1', unit: 'spoon', quantity: '1' },
          { name: 'Ingredient 2', unit: 'cup', quantity: '2' },
          { name: 'Ingredient 3', quantity: '5' },
        ],
        instructions:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        lastUpdated: '2022-01-02',
      },
      {
        id: '3',
        author: 'John Doe',
        isSaved: true,
        isAuthor: true,
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
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        lastUpdated: '2022-01-03',
      },
    ],
  },
  {
    id: '2',
    author: 'John Doe',
    isSaved: true,
    isAuthor: false,
    name: 'Recipe 2',
    image: undefined,
    description: 'Description 2',
    ingredients: [
      { name: 'Ingredient 1', unit: 'spoon', quantity: '1' },
      { name: 'Ingredient 2', unit: 'cup', quantity: '2' },
      { name: 'Ingredient 3', quantity: '5' },
    ],
    instructions:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    lastUpdated: '2022-01-02',
  },
  {
    id: '3',
    author: 'John Doe',
    isSaved: true,
    isAuthor: false,
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
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    lastUpdated: '2022-01-03',
  },
];
