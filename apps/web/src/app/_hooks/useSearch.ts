'use client';

import { useState } from 'react';

export function useSearch(initialValue = '') {
  const [searchQuery, setSearchQuery] = useState(initialValue);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return { searchQuery, handleSearchChange };
}
