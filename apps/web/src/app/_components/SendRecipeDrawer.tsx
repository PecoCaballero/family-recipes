import { Avatar, Drawer, List, ListItem, Typography } from "@mui/material"
import { Recipe } from "../_types/recipe"
import { mockGroups } from "../__mocks__/groups"

type PpSendRecipeDrawer = {
    open: boolean;
    onClose: () => void;
    recipe: Recipe;
}


export function SendRecipeDrawer({ open, onClose, recipe, }: PpSendRecipeDrawer) {
    return <Drawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        sx={{ borderRadius: 2 }}
        slotProps={{
            paper: {
                sx: {
                    borderRadius: 2
                }
            }
        }}
    >
        <List sx={{ maxHeight: '50vh' }}>
            {mockGroups.map((group) => (
                <ListItem sx={{ gap: 1 }}>
                    <Avatar src={group.icon} />
                    <Typography>{group.name}</Typography>
                </ListItem>
            ))}
        </List>
    </Drawer>
}