import { useMemo } from 'react'

import { timeDesc, getTransactionSourceValue } from '../utils'
import { RootStore } from '../stores'
import { useStore } from '../context/StoreContext'
import { SystemTransaction, SystemSubTransaction } from '../types'

export function useExpenseTableRows() {
    const { expenseStore, expenseFilterStore } = useStore()

    return useMemo(() => {
        const result: (SystemTransaction | SystemSubTransaction)[] = []

        expenseStore.expensesInDateRange
            .slice()
            .sort(timeDesc)
            .forEach((expense) => {
                const subExpenses =
                    expenseStore.subExpensesInDateRangeMap.get(expense.id) || []

                if (shouldShowTransaction(expense, expenseFilterStore)) {
                    result.push(expenseToTableRow(expense, subExpenses))
                }

                for (const subExpense of subExpenses) {
                    if (
                        shouldShowSubTransaction(
                            expense,
                            subExpense,
                            expenseFilterStore
                        )
                    ) {
                        result.push(subExpenseToTableRow(subExpense))
                    }
                }
            })

        return result
    }, [
        expenseStore.expensesInDateRange,
        expenseStore.subExpensesInDateRangeMap,
        expenseFilterStore.sources,
        expenseFilterStore.categories,
        expenseFilterStore.labels,
    ])
}

function shouldShowTransaction(
    transaction: SystemTransaction,
    filters: RootStore['expenseFilterStore']
) {
    if (filters.sources.length > 0) {
        const sourceValue = getTransactionSourceValue(transaction)
        if (!filters.sources.includes(sourceValue)) {
            return false
        }
    }

    if (filters.categories.length > 0) {
        if (
            !transaction.category ||
            !filters.categories.includes(transaction.category)
        ) {
            return false
        }
    }

    if (filters.labels.length > 0) {
        if (
            !transaction.labels.some((label) => filters.labels.includes(label))
        ) {
            return false
        }
    }

    return true
}

function shouldShowSubTransaction(
    transaction: SystemTransaction,
    subTransaction: SystemSubTransaction,
    filters: RootStore['expenseFilterStore']
) {
    if (filters.sources.length > 0) {
        const sourceValue = getTransactionSourceValue(transaction)
        if (!filters.sources.includes(sourceValue)) {
            return false
        }
    }

    if (filters.categories.length > 0) {
        if (
            !subTransaction.category ||
            !filters.categories.includes(subTransaction.category)
        ) {
            return false
        }
    }

    if (filters.labels.length > 0) {
        if (
            !subTransaction.labels.some((label) =>
                filters.labels.includes(label)
            )
        ) {
            return false
        }
    }

    return true
}

function expenseToTableRow(
    expense: SystemTransaction,
    subExpenses: SystemSubTransaction[]
): SystemTransaction {
    const subExpensesSum = subExpenses.reduce(
        (sum, subExpense) => sum + subExpense.amount,
        0
    )
    const subExpensesRefSum = subExpenses.reduce(
        (sum, sub) => sum + sub.referenceAmount,
        0
    )
    const expenseAmount = expense.amount - subExpensesSum
    const expenseRefAmount = expense.referenceAmount - subExpensesRefSum

    return {
        ...expense,
        amount: -expenseAmount,
        referenceAmount: expenseRefAmount,
    }
}

function subExpenseToTableRow(
    subExpense: SystemSubTransaction
): SystemSubTransaction {
    return {
        ...subExpense,
        amount: -subExpense.amount,
    }
}
