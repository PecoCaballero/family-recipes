'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Groups, Search, Settings, Book } from '@mui/icons-material';
import { routes } from '@/app/_utils/routes';

export default function BottomNavigator() {
  const pathname = usePathname();
  const router = useRouter();

  const navigationItems = [
    {
      label: routes.groups.base.title,
      icon: <Groups />,
      path: routes.groups.base.path
    },
    {
      label: routes.recipes.base.title,
      icon: <Book />,
      path: routes.recipes.base.path
    },
    {
      label: routes.search.base.title,
      icon: <Search />,
      path: routes.search.base.path
    },
    {
      label: routes.settings.base.title,
      icon: <Settings />,
      path: routes.settings.base.path
    },
  ];

  const currentPath = pathname.split('/')[1];
  const value = navigationItems.find(item => item.path === `/${currentPath}`)?.label || 'Groups';

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    const item = navigationItems.find(item => item.label === newValue);
    if (item) {
      router.push(item.path);
    }
  };

  return (
    <BottomNavigation
      value={value}
      onChange={handleChange}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: 'background.paper',
      }}
      showLabels
    >
      {navigationItems.map((item) => (
        <BottomNavigationAction
          key={item.label}
          label={item.label}
          icon={item.icon}
          value={item.label}
        />
      ))}
    </BottomNavigation>
  );
}
