import { PpWC } from "@/app/_types/types";
import { routes } from "@/app/_utils/routes";


export const metadata = {
    title: routes.groups.base.title,
}


export default function GroupsLayout({ children }: PpWC) {
    return children;
}