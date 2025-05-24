'use client';

import { Group } from "../_types/group"
import { Grid, Card, CardContent, Avatar, CardActionArea, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export type PpGroupList = { groups: Group[] }

export function GroupList({ groups }: PpGroupList) {
    const router = useRouter();
    return (
        <>
            {
                groups.map((group: Group) => (
                    <Grid container spacing={2} key={group.id}>
                        <Card
                            elevation={0}
                            sx={{
                                height: '100%',
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <CardActionArea
                                onClick={() => router.push(`/groups/${group.id}`)}
                                sx={{ flexGrow: 1 }}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Avatar src={group.icon} />
                                        <Stack>
                                            <Typography>
                                                {group.name}
                                            </Typography>

                                            <Typography variant="caption" color="text.secondary">
                                                Last updated: {new Date(group.lastUpdated).toLocaleDateString()}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))
            }
        </>
    );
}