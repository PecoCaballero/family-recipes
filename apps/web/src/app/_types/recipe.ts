export type Recipe = {
    id: string;
    author: string;
    isSaved: boolean;
    isAuthor: boolean;
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