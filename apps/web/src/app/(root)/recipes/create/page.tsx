'use client';

import { Suspense } from 'react';
import { RecipeFormScene } from '@/app/_scenes/RecipeFormScene';

export default function CreateRecipePage() {
  return (
    <Suspense>
      <RecipeFormScene isEditing={false} />
    </Suspense>
  );
}
