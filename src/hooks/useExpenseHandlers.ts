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
            onCommentChange: (id, comment) =>
                transactionStore.updateField(id, { comment }),
            onCategoryChange: (id, category) =>
                transactionStore.updateField(id, { category }),
            onLabelChange: (id, labels) =>
                transactionStore.updateField(id, { labels }),
            onHideChange: (id, hide) =>
                transactionStore.updateField(id, { hide }),
            onCapitalizeChange: (id, capitalized) =>
                transactionStore.updateField(id, { capitalized }),
            onDelete: transactionStore.delete,
            onSubTransactionCreate: transactionStore.createChildExpense,
        }),
        [
            transactionStore.updateField,
            transactionStore.delete,
            transactionStore.createChildExpense,
        ]
    )
}
