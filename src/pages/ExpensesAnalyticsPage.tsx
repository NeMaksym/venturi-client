import React from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

import { YearlyCategoryChart, PageLayout } from '../components'
import { fromSmallestUnit } from '../utils/formatAmount'
import { useStore } from '../context/StoreContext'

const ExpensesAnalyticsPage: React.FC = () => {
    const { expenseCategoryStore, transactionStore } = useStore()

    const renderContent = () => {
        if (transactionStore.loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            )
        }

        if (transactionStore.error) {
            return (
                <Alert severity="error">
                    Error loading expense data: {transactionStore.error}
                </Alert>
            )
        }

        return (
            <YearlyCategoryChart
                data={transactionStore.allExpenses.reduce(
                    (acc, expense) => {
                        const category =
                            expenseCategoryStore.categoriesMap[
                                expense.category
                            ] ?? 'Uncategorized'

                        if (!category) {
                            return acc
                        }

                        if (acc[category] === undefined) {
                            acc[category] = Array(12).fill(0)
                        }

                        const refAmount = fromSmallestUnit(
                            expense.referenceAmount
                        )
                        const month = new Date(expense.time).getMonth()

                        if (acc[category][month] !== undefined) {
                            acc[category][month] += refAmount
                        }

                        return acc
                    },
                    {} as Record<string, number[]>
                )}
            />
        )
    }

    return <PageLayout title="Analytics">{renderContent()}</PageLayout>
}

export { ExpensesAnalyticsPage }
