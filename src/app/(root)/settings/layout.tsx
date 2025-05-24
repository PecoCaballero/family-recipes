import { PpWC } from "@/app/_types/types";
import { routes } from "@/app/_utils/routes";


export const metadata = {
    title: routes.settings.base.title,
}


export default function SettingsLayout({ children }: PpWC) {
    return children;
}
