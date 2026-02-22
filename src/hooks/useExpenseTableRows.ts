import { useMemo } from 'react'
import { timeDesc, getTransactionSourceValue } from '../utils'
import { RootStore } from '../stores'
import { useStore } from '../context/StoreContext'
import { AnyTransaction, SubTransaction } from '../types'

export function useExpenseTableRows() {
    const { transactionStore, expenseFilterStore } = useStore()

    return useMemo(() => {
        const result: (AnyTransaction | SubTransaction)[] = []

        transactionStore.expensesInDateRange
            .slice()
            .sort(timeDesc)
            .forEach((expense) => {
                const subExpenses =
                    transactionStore.subExpensesMapInDateRange.get(
                        expense.id
                    ) || []

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
        transactionStore.expensesInDateRange,
        transactionStore.subExpensesMapInDateRange,
        expenseFilterStore.sources,
        expenseFilterStore.categories,
        expenseFilterStore.labels,
    ])
}

function shouldShowTransaction(
    transaction: AnyTransaction,
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
    transaction: AnyTransaction,
    subTransaction: SubTransaction,
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
    expense: AnyTransaction,
    subExpenses: SubTransaction[]
): AnyTransaction {
    const subExpensesSum = subExpenses.reduce(
        (sum, subExpense) => sum + subExpense.source.amount,
        0
    )
    const subExpensesRefSum = subExpenses.reduce(
        (sum, sub) => sum + sub.referenceAmount,
        0
    )
    const expenseAmount = expense.source.amount - subExpensesSum
    const expenseRefAmount = expense.referenceAmount - subExpensesRefSum

    return {
        ...expense,
        source: {
            ...expense.source,
            amount: -expenseAmount,
        },
        referenceAmount: expenseRefAmount,
    }
}

function subExpenseToTableRow(subExpense: SubTransaction): SubTransaction {
    return {
        ...subExpense,
        source: {
            ...subExpense.source,
            amount: -subExpense.source.amount,
        },
    }
}
