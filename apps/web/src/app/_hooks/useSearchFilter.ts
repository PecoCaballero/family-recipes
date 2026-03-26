import { useState } from 'react';

export function useSearchFilter<T>(data: T[], property: keyof T) {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredData = data.filter((item) => {
    const value = property ? item[property] : item;
    return (value as string).toLowerCase().includes(searchQuery.toLowerCase());
  });
  return {
    filteredData,
    searchQuery,
    setSearchQuery,
  };
}
