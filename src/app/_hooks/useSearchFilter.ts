export function useSearchFilter<T>(
  data: T[],
  searchQuery: string,
  property: keyof T
) {
  const filteredData = data.filter((item) => {
    const value = property ? item[property] : item;
    return (value as string).toLowerCase().includes(searchQuery.toLowerCase());
  });
  return filteredData;
}
