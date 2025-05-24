
import { ArrowBack } from "@mui/icons-material"
import { Box, IconButton, Stack, Typography } from "@mui/material"
import { styled } from "@mui/material/styles"
import { useRouter } from "next/navigation"

const StyledStack = styled(Stack)(
    () => ({
        alignItems: 'center',
        justifyContent: 'space-between',
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        backgroundColor: 'background.paper',
        padding: 2,
        zIndex: 1,
    })
)

type PpHeader = { title: string, endSlot?: React.ReactNode, goBack?: boolean }


export function Header({ title, endSlot, goBack = false }: PpHeader): React.ReactElement {

    const router = useRouter()

    return (
        <StyledStack direction="row">
            {goBack && (
                <IconButton
                    aria-label="back"
                    onClick={() => router.back()}
                >
                    <ArrowBack />
                </IconButton>
            )}
            <Typography
                variant="h6"
                component="h1"
                sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
            >
                {title}
            </Typography>
            <Box minWidth={40}>
                {endSlot}
            </Box>
        </StyledStack>
    )
}