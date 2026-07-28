import { PpWC } from '@/app/_types/types';
import { routes } from '@/app/_utils/routes';

export const metadata = {
  title: routes.user.base.title,
};

export default function UserLayout({ children }: PpWC) {
  return children;
}
