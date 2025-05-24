import { PpWC } from "@/app/_types/types";
import { routes } from "@/app/_utils/routes";


export const metadata = {
    title: routes.recipes.base.title,
}


export default function RecipesLayout({ children }: PpWC) {
    return children;
}
