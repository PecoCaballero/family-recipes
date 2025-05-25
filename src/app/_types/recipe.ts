export type Recipe = {
  id: string;
  author: string;
  name: string;
  image: string | undefined;
  description: string;
  ingredients: string[];
  instructions: string[];
  lastUpdated: string;
};
