import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import CssBaseline from '@mui/material/CssBaseline'

import { uploadPage, PagePath, expensesPages, debugPages } from './pages/routes'
import { AppLayout, Theme } from './components'
import { StoreProvider } from './context/StoreContext'
import { useStore } from './context/StoreContext'

const pages = [...uploadPage, ...expensesPages]
const AppRoutes: React.FC = () => {
    const { uiStore } = useStore()

    return (
        <Routes>
            {pages.map(({ element, path }) => (
                <Route key={path} path={path} element={element} />
            ))}
            <Route
                path={PagePath.EXPENSES}
                element={<Navigate to={PagePath.EXPENSES_TRANSACTIONS} />}
            />
            <Route
                path="/"
                element={<Navigate to={PagePath.UPLOAD} replace />}
            />
            {uiStore.debug &&
                debugPages.map(({ element, path }) => (
                    <Route key={path} path={path} element={element} />
                ))}
        </Routes>
    )
}

export const App: React.FC = () => (
    <StoreProvider>
        <Theme>
            <CssBaseline />
            <BrowserRouter>
                <AppLayout>
                    <AppRoutes />
                </AppLayout>
            </BrowserRouter>
        </Theme>
    </StoreProvider>
)
