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
            onCommentChange: (id, comment, subId) =>
                transactionStore.updateField(id, { comment }, subId),
            onCategoryChange: (id, category, subId) =>
                transactionStore.updateField(id, { category }, subId),
            onLabelChange: (id, labels, subId) =>
                transactionStore.updateField(id, { labels }, subId),
            onHideChange: (id, hide, subId) =>
                transactionStore.updateField(id, { hide }, subId),
            onCapitalizeChange: (id, capitalized, subId) =>
                transactionStore.updateField(id, { capitalized }, subId),
            onDelete: transactionStore.delete,
            onSubTransactionCreate: transactionStore.createSubExpense,
        }),
        [
            transactionStore.updateField,
            transactionStore.delete,
            transactionStore.createSubExpense,
        ]
    )
}
