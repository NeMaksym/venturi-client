import React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'

import { useStore } from '../context/StoreContext'

export const TopBar: React.FC = () => {
    const { uiStore } = useStore()

    return (
        <AppBar
            position="static"
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Venturi{' '}
                    <Box component="sup" sx={{ fontSize: '0.6em', ml: -0.5 }}>
                        Alfa
                    </Box>
                </Typography>
                <IconButton
                    color="inherit"
                    onClick={() => uiStore.toggleMode()}
                    aria-label="toggle theme"
                >
                    {uiStore.mode === 'dark' ? (
                        <Brightness7Icon />
                    ) : (
                        <Brightness4Icon />
                    )}
                </IconButton>
            </Toolbar>
        </AppBar>
    )
}
