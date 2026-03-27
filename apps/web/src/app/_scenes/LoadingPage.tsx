import { Typography } from "@mui/material";
import { CenteredFullPage, Scene } from "../_components/SceneComponents";
import { CircularProgress } from '@mui/material'


export function LoadingPage() {
    return <CenteredFullPage>

        <CircularProgress />
        <Typography>Loading...</Typography>
    </CenteredFullPage>

}