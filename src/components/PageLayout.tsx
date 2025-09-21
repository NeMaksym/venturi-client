import { PropsWithChildren } from 'react'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'

interface PageLayoutProps extends PropsWithChildren {
    title: string
    header?: React.ReactNode
}

export const PageLayout: React.FC<PageLayoutProps> = ({
    children,
    title,
    header = null,
}) => {
    return (
        <Stack spacing={4}>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
            >
                <Typography variant="h4">{title}</Typography>
                <Box>{header}</Box>
            </Stack>

            {children}
        </Stack>
    )
}
