import React, { useEffect } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

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
            <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6">Yearly Overview</Typography>
                <Tooltip title="Expenses grouped by category across all months of the selected year">
                    <InfoOutlinedIcon fontSize="small" color="action" />
                </Tooltip>
            </Stack>
            <ChartLoader
                loading={expenseAnalyticsStore.yearlyLoading}
                error={expenseAnalyticsStore.yearlyError}
            >
                <YearlyCategoryChart
                    data={expenseAnalyticsStore.yearlyCategoryBreakdown}
                />
            </ChartLoader>

            <Divider />

            <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6">Monthly Breakdown</Typography>
                <Tooltip title="Expense distribution by category for the selected month">
                    <InfoOutlinedIcon fontSize="small" color="action" />
                </Tooltip>
            </Stack>
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
