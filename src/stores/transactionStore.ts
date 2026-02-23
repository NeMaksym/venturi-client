import { makeAutoObservable } from 'mobx'

import { RootStore } from './rootStore'
import { toSmallestUnit, timeDesc } from '../utils'
import { TransactionService } from '../db/services'
import { AnyTransaction } from '../types'

type ChildrenMap = Map<string, AnyTransaction[]>

export class TransactionStore {
    private readonly root: RootStore
    private readonly transactionService: TransactionService

    loading = false
    error: string | null = null
    transactions: AnyTransaction[] = []

    isParentTransaction(transaction: AnyTransaction) {
        return transaction.parentId === null
    }

    isChildTransaction(transaction: AnyTransaction) {
        return transaction.parentId !== null
    }

    get allExpenses() {
        return this.transactions.filter((t) => t.type === 'expense')
    }

    get allParentExpenses() {
        return this.allExpenses.filter((t) => this.isParentTransaction(t))
    }

    get allIncomes() {
        return this.transactions.filter((t) => t.type === 'income')
    }

    get allParentIncomes() {
        return this.allIncomes.filter((t) => this.isParentTransaction(t))
    }

    get parentExpensesInDateRange() {
        const filters = this.root.expenseFilterStore

        return this.allParentExpenses.filter(
            (expense) =>
                expense.time >= filters.unixStartDate &&
                expense.time <= filters.unixEndDate
        )
    }

    get childExpensesMapInDateRange(): ChildrenMap {
        const filters = this.root.expenseFilterStore

        return this.transactions
            .filter(
                (t) =>
                    this.isChildTransaction(t) &&
                    t.type === 'expense' &&
                    t.time >= filters.unixStartDate &&
                    t.time <= filters.unixEndDate
            )
            .sort(timeDesc)
            .reduce<ChildrenMap>((acc, t) => {
                const children = acc.get(t.parentId!) || []
                children.push(t)
                acc.set(t.parentId!, children)
                return acc
            }, new Map())
    }

    async transactionExists(
        transaction:
            | AnyTransaction
            | Omit<AnyTransaction, 'createdAt' | 'updatedAt'>
    ): Promise<boolean> {
        return await this.transactionService.transactionExists(transaction)
    }

    constructor(root: RootStore, transactionService: TransactionService) {
        makeAutoObservable(this, {}, { autoBind: true })
        this.root = root
        this.transactionService = transactionService
    }

    *loadAll() {
        this.loading = true
        this.error = null

        try {
            const transactions: AnyTransaction[] =
                yield this.transactionService.getAllTransactions()

            this.transactions = transactions
        } catch (e) {
            this.error =
                e instanceof Error ? e.message : 'Failed to load transactions'
        } finally {
            this.loading = false
        }
    }

    *updateField(
        id: string,
        updates: Partial<
            Pick<
                AnyTransaction,
                'category' | 'labels' | 'comment' | 'hide' | 'capitalized'
            >
        >
    ) {
        const transaction: AnyTransaction | undefined =
            yield this.transactionService.getTransactionById(id)
        if (!transaction) return

        const updated: AnyTransaction = this.isChildTransaction(transaction)
            ? yield this.transactionService.updateChildTransaction(id, updates)
            : yield this.transactionService.updateParentTransaction(id, updates)

        this.transactions = this.transactions.map((t) =>
            t.id === id ? updated : t
        )
    }

    *delete(id: string) {
        const transaction: AnyTransaction | undefined =
            yield this.transactionService.getTransactionById(id)
        if (!transaction) return

        if (this.isChildTransaction(transaction)) {
            yield this.transactionService.deleteChildTransaction(id)
            this.transactions = this.transactions.filter((t) => t.id !== id)
        } else {
            yield this.transactionService.deleteParentTransaction(id)
            this.transactions = this.transactions.filter(
                (t) => t.id !== id && t.parentId !== id
            )
        }
    }

    *createChildExpense(transactionId: string, amount: number) {
        const transaction: AnyTransaction | undefined =
            yield this.transactionService.getTransactionById(transactionId)
        if (!transaction) return

        const exchangeRate =
            transaction.referenceAmount / -transaction.source.amount

        const childTransaction: AnyTransaction =
            yield this.transactionService.addChildTransaction({
                ...transaction,
                id: crypto.randomUUID(),
                parentId: transactionId,
                source: {
                    ...transaction.source,
                    amount: -toSmallestUnit(amount),
                },
                referenceAmount: toSmallestUnit(amount * exchangeRate),
                capitalized: false,
                hide: false,
                comment: '',
            })

        this.transactions.push(childTransaction)
    }

    *resetCategory(categoryId: string) {
        yield this.transactionService.resetCategory(categoryId)

        this.transactions = this.transactions.map((t) =>
            t.category === categoryId ? { ...t, category: '' } : t
        )
    }

    *addParentTransaction(
        rawTransaction: Omit<AnyTransaction, 'createdAt' | 'updatedAt'>
    ) {
        const transaction: AnyTransaction =
            yield this.transactionService.addParentTransaction(rawTransaction)

        this.transactions.push(transaction)
    }
}
