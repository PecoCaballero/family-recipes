export type Recipe = {
    id: string;
    author: string;
    name: string;
    image: string | undefined;
    description: string;
    ingredients: Ingredient[];
    instructions: string;
    lastUpdated: string;
    nestedRecipes?: Recipe[];
};


export type Ingredient = {
    name: string;
    unit?: string;
    quantity: string;
}