import { useMemo } from 'react'
import {
    TransactionActionHandler,
    TransactionDeleteHandler,
} from '../components/TransactionsTable/types'
import { useStore } from '../context/StoreContext'

export interface ExpenseHandlers {
    onCommentChange: TransactionActionHandler<string>
    onCategoryChange: TransactionActionHandler<string>
    onLabelChange: TransactionActionHandler<string[]>
    onHideChange: TransactionActionHandler<boolean>
    onCapitalizeChange: TransactionActionHandler<boolean>
    onDelete: TransactionDeleteHandler
    onSubTransactionCreate: TransactionActionHandler<number>
}

export function useExpenseHandlers(): ExpenseHandlers {
    const { transactionStore } = useStore()

    return useMemo(
        () => ({
            onCommentChange: (expenseId, comment, subExpenseId) => {
                const payload = { comment }

                subExpenseId
                    ? transactionStore.updateSubExpenseField(
                          subExpenseId,
                          payload
                      )
                    : transactionStore.updateTransactionField(
                          expenseId,
                          payload
                      )
            },
            onCategoryChange: (expenseId, category, subExpenseId) => {
                const payload = { category }

                subExpenseId
                    ? transactionStore.updateSubExpenseField(
                          subExpenseId,
                          payload
                      )
                    : transactionStore.updateTransactionField(
                          expenseId,
                          payload
                      )
            },
            onLabelChange: (expenseId, labels, subExpenseId) => {
                const payload = { labels }

                subExpenseId
                    ? transactionStore.updateSubExpenseField(
                          subExpenseId,
                          payload
                      )
                    : transactionStore.updateTransactionField(
                          expenseId,
                          payload
                      )
            },
            onHideChange: (expenseId, hide, subExpenseId) => {
                const payload = { hide }

                subExpenseId
                    ? transactionStore.updateSubExpenseField(
                          subExpenseId,
                          payload
                      )
                    : transactionStore.updateTransactionField(
                          expenseId,
                          payload
                      )
            },
            onCapitalizeChange: (expenseId, capitalized, subExpenseId) => {
                const payload = { capitalized }

                subExpenseId
                    ? transactionStore.updateSubExpenseField(
                          subExpenseId,
                          payload
                      )
                    : transactionStore.updateTransactionField(
                          expenseId,
                          payload
                      )
            },
            onDelete: transactionStore.delete,
            onSubTransactionCreate: transactionStore.createSubExpense,
        }),
        [
            transactionStore.updateTransactionField,
            transactionStore.updateSubExpenseField,
            transactionStore.delete,
            transactionStore.createSubExpense,
        ]
    )
}
