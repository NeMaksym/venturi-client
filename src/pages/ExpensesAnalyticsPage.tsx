import React, { useEffect } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

import {
    YearlyCategoryChart,
    MonthlyCategoryChart,
    PageLayout,
} from '../components'
import { useStore } from '../context/StoreContext'

const ChartLoader: React.FC<{
    loading: boolean
    error: string | null
    children: React.ReactNode
}> = ({ loading, error, children }) => {
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        )
    }

    if (error) {
        return (
            <Alert severity="error">Error loading expense data: {error}</Alert>
        )
    }

    return <>{children}</>
}

const ExpensesAnalyticsPage: React.FC = () => {
    const { expenseAnalyticsStore } = useStore()

    useEffect(() => {
        expenseAnalyticsStore.loadYearlyExpenses()
        expenseAnalyticsStore.loadMonthlyExpenses()
    }, [])

    return (
        <PageLayout title="Analytics">
            <ChartLoader
                loading={expenseAnalyticsStore.yearlyLoading}
                error={expenseAnalyticsStore.yearlyError}
            >
                <YearlyCategoryChart
                    data={expenseAnalyticsStore.yearlyCategoryBreakdown}
                />
            </ChartLoader>
            <ChartLoader
                loading={expenseAnalyticsStore.monthlyLoading}
                error={expenseAnalyticsStore.monthlyError}
            >
                <MonthlyCategoryChart
                    data={expenseAnalyticsStore.monthlyCategoryBreakdown}
                />
            </ChartLoader>
        </PageLayout>
    )
}

export { ExpensesAnalyticsPage }
