import { PpWC } from "@/app/_types/types";
import { routes } from "@/app/_utils/routes";


export const metadata = {
    title: routes.search.base.title,
}


export default function SearchLayout({ children }: PpWC) {
    return children;
}
