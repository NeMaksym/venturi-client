import { useMemo } from 'react'
import { timeDesc, getTransactionSourceValue } from '../utils'
import { RootStore } from '../stores'
import { useStore } from '../context/StoreContext'
import { AnyTransaction } from '../types'

export function useExpenseTableRows() {
    const { transactionStore, expenseFilterStore } = useStore()

    return useMemo(() => {
        const result: AnyTransaction[] = []

        const childExpensesMap = transactionStore.childExpensesMapInDateRange

        transactionStore.parentExpensesInDateRange
            .slice()
            .sort(timeDesc)
            .forEach((parentExpense) => {
                const childExpenses =
                    childExpensesMap.get(parentExpense.id) || []

                if (shouldShowTransaction(parentExpense, expenseFilterStore)) {
                    result.push(expenseToTableRow(parentExpense, childExpenses))
                }

                for (const child of childExpenses) {
                    if (shouldShowTransaction(child, expenseFilterStore)) {
                        result.push(childToTableRow(child))
                    }
                }
            })

        return result
    }, [
        transactionStore.parentExpensesInDateRange,
        transactionStore.childExpensesMapInDateRange,
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

// TODO: See if converting to negative can be removed
function expenseToTableRow(
    expense: AnyTransaction,
    children: AnyTransaction[]
): AnyTransaction {
    const childrenSum = children.reduce(
        (sum, child) => sum + child.source.amount,
        0
    )
    const childrenRefSum = children.reduce(
        (sum, child) => sum + child.referenceAmount,
        0
    )
    const parentExpenseAmount = expense.source.amount - childrenSum
    const parentExpenseRefAmount = expense.referenceAmount - childrenRefSum

    return {
        ...expense,
        source: {
            ...expense.source,
            amount: -parentExpenseAmount,
        },
        referenceAmount: parentExpenseRefAmount,
    }
}

// TODO: See if can be removed
function childToTableRow(child: AnyTransaction): AnyTransaction {
    return {
        ...child,
        source: {
            ...child.source,
            amount: -child.source.amount,
        },
    }
}
