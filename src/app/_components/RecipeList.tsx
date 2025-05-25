import { Card, CardActionArea, CardContent, CardMedia, Grid, Stack, Typography } from "@mui/material"
import { useRouter } from "next/navigation"
import { Recipe } from "../_types/recipe"

export type PpRecipeList = { recipes: Recipe[] }

export function RecipeList({ recipes }: PpRecipeList) {
    const router = useRouter();
    return (
        <>
            {
                recipes.map((recipe: Recipe) => (
                    <Grid container spacing={2} key={recipe.id} margin={2}>
                        <Card
                            variant="outlined"
                            elevation={0}
                            sx={{
                                height: '100%',
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <CardActionArea
                                onClick={() => router.push(`/recipes/${recipe.id}`)}
                                sx={{ flexGrow: 1 }}
                            >
                                {recipe.image && <CardMedia
                                    component="img"
                                    image={recipe.image}
                                    alt={recipe.name}
                                    sx={{
                                        maxHeight: '100px',
                                    }}
                                />}
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                                        <Typography variant="h6" component="h2">
                                            {recipe.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {recipe.author}
                                        </Typography>
                                    </Stack>
                                    {!recipe.image && <Typography variant="body2" color="text.secondary"  >
                                        {recipe.description}
                                    </Typography>}
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))
            }
        </>
    )
}
