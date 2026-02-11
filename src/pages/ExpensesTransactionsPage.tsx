import React from 'react'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

import {
    TransactionsTable,
    TransactionsFilter,
    PageLayout,
} from '../components'
import { useStore } from '../context/StoreContext'
import {
    useExpenseHandlers,
    useExpenseTableRows,
    useExpenseTableStats,
} from '../hooks'

export const ExpensesTransactionsPage: React.FC = () => {
    const { expenseCategoryStore, transactionStore, expenseFilterStore } =
        useStore()

    const handlers = useExpenseHandlers()
    const rows = useExpenseTableRows()
    const stats = useExpenseTableStats(rows)

    const renderContent = () => {
        if (transactionStore.loading) {
            return <Typography>Loading transactions...</Typography>
        }

        if (transactionStore.error) {
            return (
                <Typography color="error">
                    Error: {transactionStore.error}
                </Typography>
            )
        }

        return (
            <Stack spacing={4}>
                <Stack direction="row" spacing={2}>
                    {/* TODO: Make this section collapsable */}
                    <Typography variant="body1" gutterBottom>
                        Total transactions: {rows.length}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Total amount: {stats.totalAmount} (
                        {stats.totalRefAmount})
                    </Typography>
                </Stack>
                <TransactionsFilter />
                <TransactionsTable
                    rows={rows}
                    handlers={handlers}
                    options={{
                        categories: expenseCategoryStore.categories,
                        labels: expenseFilterStore.labelOptions,
                    }}
                />
            </Stack>
        )
    }

    return <PageLayout title="Transactions">{renderContent()}</PageLayout>
}
