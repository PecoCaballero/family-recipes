'use client';

import { useState } from 'react';
import { SceneContainer } from '@/app/_components/sceneContainer';
import { mockRecipes } from '@/app/__mocks__/recipes';
import { RecipeList } from '@/app/_components/RecipeList';
import { Box, TextField } from '@mui/material';
import { useSearchFilter } from '@/app/_hooks/useSearchFilter';
import SearchIcon from '@mui/icons-material/Search';
import { SearchInput } from '@/app/_components/SearchInput';

export default function RecipesPage() {
  const { filteredData, searchQuery, setSearchQuery } = useSearchFilter(mockRecipes, 'name');

  return (
    <SceneContainer>
      <Box sx={{ margin: 2 }}>
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search recipes..."
        />
      </Box>
      <RecipeList recipes={filteredData} />
    </SceneContainer>
  );
}
