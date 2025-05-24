import { Group } from "@/app/_types/group";

export const mockGroups: Group[] = [
  {
    id: "1",
    name: "Family Recipes",
    description: "Our favorite family recipes passed down through generations",
    lastUpdated: new Date("2025-05-20").toISOString(),
    icon: "https://cf.ltkcdn.net/family/images/std/200821-800x533r1-family.jpg",
  },
  {
    id: "2",
    name: "Holiday Specials",
    description: "Recipes for special occasions and holidays",
    lastUpdated: new Date("2025-05-15").toISOString(),
    icon: "https://cf.ltkcdn.net/family/images/std/200821-800x533r1-family.jpg",
  },
  {
    id: "3",
    name: "Weeknight Dinners",
    description: "Quick and easy recipes for busy weeknights",
    lastUpdated: new Date("2025-05-22").toISOString(),
    icon: "https://cf.ltkcdn.net/family/images/std/200821-800x533r1-family.jpg",
  },
  {
    id: "4",
    name: "Breakfast Favorites",
    description: "Delicious breakfast recipes to start your day",
    lastUpdated: new Date("2025-05-18").toISOString(),
    icon: "https://cf.ltkcdn.net/family/images/std/200821-800x533r1-family.jpg",
  },
];
