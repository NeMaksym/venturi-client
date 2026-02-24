import React, { useEffect } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

import { YearlyCategoryChart, PageLayout } from '../components'
import { useStore } from '../context/StoreContext'

const ExpensesAnalyticsPage: React.FC = () => {
    const { expenseAnalyticsStore } = useStore()

    useEffect(() => {
        expenseAnalyticsStore.loadExpenses()
    }, [])

    const renderContent = () => {
        if (expenseAnalyticsStore.loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            )
        }

        if (expenseAnalyticsStore.error) {
            return (
                <Alert severity="error">
                    Error loading expense data: {expenseAnalyticsStore.error}
                </Alert>
            )
        }

        return (
            <YearlyCategoryChart
                data={expenseAnalyticsStore.yearlyCategoryBreakdown}
            />
        )
    }

    return <PageLayout title="Analytics">{renderContent()}</PageLayout>
}

export { ExpensesAnalyticsPage }
