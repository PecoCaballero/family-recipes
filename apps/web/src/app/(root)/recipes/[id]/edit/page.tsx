'use client';

import { Suspense } from 'react';
import { RecipeFormScene } from '@/app/_scenes/RecipeFormScene';

export default function EditRecipePage() {
  return (
    <Suspense>
      <RecipeFormScene isEditing={true} />
    </Suspense>
  );
}
