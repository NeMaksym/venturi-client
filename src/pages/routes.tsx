import { ExpensesTransactionsPage } from './ExpensesTransactionsPage'
import { UploadPage } from './UploadPage'
import { ExpensesSettingsPage } from './ExpensesSettingsPage'
import { ExpensesAnalyticsPage } from './ExpensesAnalyticsPage'
import { DebugPage } from './DebugPage'

export const enum PagePath {
    UPLOAD = '/upload',
    EXPENSES = '/expenses',
    EXPENSES_TRANSACTIONS = '/expenses/transactions',
    EXPENSES_ANALYTICS = '/expenses/analytics',
    EXPENSES_SETTINGS = '/expenses/settings',
    DEBUG = '/debug',
}
export interface PageRoute {
    element: React.ReactNode
    name: string
    path: PagePath
}

export const uploadPage: PageRoute[] = [
    {
        element: <UploadPage />,
        name: 'Upload',
        path: PagePath.UPLOAD,
    },
]

export const expensesPages: PageRoute[] = [
    {
        element: <ExpensesTransactionsPage />,
        name: 'Transactions',
        path: PagePath.EXPENSES_TRANSACTIONS,
    },
    {
        element: <ExpensesAnalyticsPage />,
        name: 'Analytics',
        path: PagePath.EXPENSES_ANALYTICS,
    },
    {
        element: <ExpensesSettingsPage />,
        name: 'Settings',
        path: PagePath.EXPENSES_SETTINGS,
    },
]

export const debugPages: PageRoute[] = [
    {
        element: <DebugPage />,
        name: 'Debug',
        path: PagePath.DEBUG,
    },
]
