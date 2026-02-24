import React, { useEffect } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

import {
    YearlyCategoryChart,
    MonthlyCategoryChart,
    PageLayout,
} from '../components'
import { useStore } from '../context/StoreContext'

const CHART_HEIGHT = 350

const MONTH_LABELS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
]

const ChartLoader: React.FC<{
    loading: boolean
    error: string | null
    height: number
    children: React.ReactNode
}> = ({ loading, error, height, children }) => {
    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height,
                }}
            >
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
        expenseAnalyticsStore.loadEarliestYear()
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
                <Select
                    size="small"
                    value={expenseAnalyticsStore.yearlySelectedYear}
                    onChange={(e) =>
                        expenseAnalyticsStore.setYearlySelectedYear(
                            e.target.value as number
                        )
                    }
                >
                    {expenseAnalyticsStore.availableYears.map((year) => (
                        <MenuItem key={year} value={year}>
                            {year}
                        </MenuItem>
                    ))}
                </Select>
            </Stack>
            <ChartLoader
                loading={expenseAnalyticsStore.yearlyLoading}
                error={expenseAnalyticsStore.yearlyError}
                height={CHART_HEIGHT}
            >
                <YearlyCategoryChart
                    data={expenseAnalyticsStore.yearlyCategoryBreakdown}
                    height={CHART_HEIGHT}
                />
            </ChartLoader>

            <Divider />

            <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6">Monthly Breakdown</Typography>
                <Tooltip title="Expense distribution by category for the selected month">
                    <InfoOutlinedIcon fontSize="small" color="action" />
                </Tooltip>
                <Select
                    size="small"
                    value={expenseAnalyticsStore.monthlySelectedYear}
                    onChange={(e) =>
                        expenseAnalyticsStore.setMonthlySelectedYear(
                            e.target.value as number
                        )
                    }
                >
                    {expenseAnalyticsStore.availableYears.map((year) => (
                        <MenuItem key={year} value={year}>
                            {year}
                        </MenuItem>
                    ))}
                </Select>
                <Select
                    size="small"
                    value={expenseAnalyticsStore.monthlySelectedMonth}
                    onChange={(e) =>
                        expenseAnalyticsStore.setMonthlySelectedMonth(
                            e.target.value as number
                        )
                    }
                >
                    {MONTH_LABELS.map((label, index) => (
                        <MenuItem key={index} value={index}>
                            {label}
                        </MenuItem>
                    ))}
                </Select>
            </Stack>
            <ChartLoader
                loading={expenseAnalyticsStore.monthlyLoading}
                error={expenseAnalyticsStore.monthlyError}
                height={CHART_HEIGHT}
            >
                <MonthlyCategoryChart
                    data={expenseAnalyticsStore.monthlyCategoryBreakdown}
                    height={CHART_HEIGHT}
                />
            </ChartLoader>
        </PageLayout>
    )
}

export { ExpensesAnalyticsPage }
