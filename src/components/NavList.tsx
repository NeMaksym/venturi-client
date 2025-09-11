import React from 'react'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Box from '@mui/material/Box'
import { useNavigate, useLocation } from 'react-router-dom'

import { uploadPage, expensesPages, debugPages } from '../pages/routes'
import { useStore } from '../context/StoreContext'

const NAVIGATION_WIDTH = 240

export const NavList: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { uiStore } = useStore()

    const navigateWithParams = (path: string) => {
        navigate(`${path}${location.search}`)
    }

    return (
        <Box
            sx={{
                width: NAVIGATION_WIDTH,
                flexShrink: 0,
                borderRight: 1,
                borderColor: 'divider',
            }}
        >
            <List sx={{ height: '100%', overflow: 'auto' }}>
                {uploadPage.map(({ path, name }) => (
                    <ListItem key={path} disablePadding>
                        <ListItemButton
                            onClick={() => navigateWithParams(path)}
                            selected={location.pathname === path}
                        >
                            <ListItemText primary={name} />
                        </ListItemButton>
                    </ListItem>
                ))}

                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() =>
                            navigateWithParams(expensesPages[0]?.path ?? '')
                        }
                    >
                        <ListItemText primary="Expenses" />
                    </ListItemButton>
                </ListItem>

                {expensesPages.map(({ path, name }) => (
                    <ListItem key={path} disablePadding>
                        <ListItemButton
                            onClick={() => navigateWithParams(path)}
                            selected={location.pathname === path}
                            sx={{ pl: 4 }}
                        >
                            <ListItemText primary={name} />
                        </ListItemButton>
                    </ListItem>
                ))}

                {uiStore.debug &&
                    debugPages.map(({ path, name }) => (
                        <ListItem key={path} disablePadding>
                            <ListItemButton
                                onClick={() => navigateWithParams(path)}
                                selected={location.pathname === path}
                            >
                                <ListItemText primary={name} />
                            </ListItemButton>
                        </ListItem>
                    ))}
            </List>
        </Box>
    )
}
