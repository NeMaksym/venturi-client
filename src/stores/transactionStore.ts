import { pick } from 'lodash'
import { makeAutoObservable } from 'mobx'

import { RootStore } from './rootStore'
import { toSmallestUnit, timeDesc } from '../utils'
import { TransactionService, SubTransactionService } from '../db/services'
import {
    SystemTransaction,
    SystemSubTransaction,
    RawSystemTransaction,
} from '../types'

type SubTransactionsMap = Map<string, SystemSubTransaction[]>

export class TransactionStore {
    private readonly root: RootStore
    private readonly transactionService: TransactionService
    private readonly subTransactionService: SubTransactionService

    loading = false
    error: string | null = null
    transactions: SystemTransaction[] = []
    subTransactions: SystemSubTransaction[] = []

    get allExpenses() {
        return this.transactions.filter((t) => t.type === 'expense')
    }

    get allIncomes() {
        return this.transactions.filter((t) => t.type === 'income')
    }

    get allSubExpenses() {
        return this.subTransactions.filter((s) => s.type === 'sub-expense')
    }

    get allSubIncomes() {
        return this.subTransactions.filter((s) => s.type === 'sub-income')
    }

    async transactionExists(
        transaction: SystemTransaction | RawSystemTransaction
    ): Promise<boolean> {
        return await this.transactionService.transactionExists(transaction)
    }

    constructor(
        root: RootStore,
        transactionService: TransactionService,
        subTransactionService: SubTransactionService
    ) {
        makeAutoObservable(this, {}, { autoBind: true })
        this.root = root
        this.transactionService = transactionService
        this.subTransactionService = subTransactionService
    }

    getTransactionsInDateRange(startDate: number, endDate: number) {
        return this.transactions.filter((transaction) => {
            return transaction.time >= startDate && transaction.time <= endDate
        })
    }

    getExpensesInDateRange(startDate: number, endDate: number) {
        return this.getTransactionsInDateRange(startDate, endDate).filter(
            (t) => t.type === 'expense'
        )
    }

    getIncomesInDateRange(startDate: number, endDate: number) {
        return this.getTransactionsInDateRange(startDate, endDate).filter(
            (t) => t.type === 'income'
        )
    }

    getSubTransactionsInDateRange(startDate: number, endDate: number) {
        return this.subTransactions.filter((sub) => {
            return sub.time >= startDate && sub.time <= endDate
        })
    }

    getSubTransactionsMapInDateRange(startDate: number, endDate: number) {
        return this.getSubTransactionsInDateRange(startDate, endDate)
            .slice()
            .sort(timeDesc)
            .reduce<SubTransactionsMap>((acc, sub) => {
                const subs = acc.get(sub.parentId) || []
                subs.push(sub)
                acc.set(sub.parentId, subs)
                return acc
            }, new Map())
    }

    get expensesInDateRange() {
        const filters = this.root.expenseFilterStore
        return this.allExpenses.filter((expense) => {
            return (
                expense.time >= filters.unixStartDate &&
                expense.time <= filters.unixEndDate
            )
        })
    }

    get subTransactionsInDateRange() {
        const filters = this.root.expenseFilterStore
        return this.subTransactions.filter((sub) => {
            return (
                sub.time >= filters.unixStartDate &&
                sub.time <= filters.unixEndDate
            )
        })
    }

    get subTransactionsMapInDateRange() {
        return this.subTransactionsInDateRange
            .slice()
            .sort(timeDesc)
            .reduce<SubTransactionsMap>((acc, sub) => {
                const subs = acc.get(sub.parentId) || []
                subs.push(sub)
                acc.set(sub.parentId, subs)
                return acc
            }, new Map())
    }

    get subExpensesInDateRange() {
        return this.subTransactionsInDateRange.filter(
            (s) => s.type === 'sub-expense'
        )
    }

    get subExpensesMapInDateRange() {
        return this.subExpensesInDateRange
            .slice()
            .sort(timeDesc)
            .reduce<SubTransactionsMap>((acc, sub) => {
                const subs = acc.get(sub.parentId) || []
                subs.push(sub)
                acc.set(sub.parentId, subs)
                return acc
            }, new Map())
    }

    *loadAll() {
        this.loading = true
        this.error = null

        try {
            const [transactions, subTransactions]: [
                SystemTransaction[],
                SystemSubTransaction[],
            ] = yield Promise.all([
                this.transactionService.getAllTransactions(),
                this.subTransactionService.getAll(),
            ])

            this.transactions = transactions
            this.subTransactions = subTransactions
        } catch (e) {
            this.error =
                e instanceof Error ? e.message : 'Failed to load transactions'
        } finally {
            this.loading = false
        }
    }

    // TODO:Improve types
    *updateField(
        transactionId: string,
        updates:
            | Omit<Partial<SystemTransaction>, 'type'>
            | Omit<Partial<SystemSubTransaction>, 'type'>,
        subTransactionId?: string
    ) {
        if (subTransactionId) {
            const sub: SystemSubTransaction | undefined =
                yield this.subTransactionService.getById(subTransactionId)
            if (!sub) return

            const updated: SystemSubTransaction =
                yield this.subTransactionService.update({
                    ...sub,
                    ...updates,
                })

            this.subTransactions = this.subTransactions.map((s) =>
                s.id === subTransactionId ? updated : s
            )
        } else {
            const transaction: SystemTransaction | undefined =
                yield this.transactionService.getTransactionById(transactionId)
            if (!transaction) return

            const updated: SystemTransaction =
                yield this.transactionService.updateTransaction({
                    ...transaction,
                    ...updates,
                })

            this.transactions = this.transactions.map((t) =>
                t.id === transactionId ? updated : t
            )
        }
    }

    *delete(transactionId: string, subTransactionId?: string) {
        if (subTransactionId) {
            yield this.subTransactionService.delete(subTransactionId)

            this.subTransactions = this.subTransactions.filter(
                (s) => s.id !== subTransactionId
            )
        } else {
            const relatedSubs = this.subTransactions.filter(
                (s) => s.parentId === transactionId
            )

            yield Promise.all([
                ...relatedSubs.map((sub) =>
                    this.subTransactionService.delete(sub.id)
                ),
                this.transactionService.deleteTransaction(transactionId),
            ])

            this.transactions = this.transactions.filter(
                (t) => t.id !== transactionId
            )
            this.subTransactions = this.subTransactions.filter(
                (s) => s.parentId !== transactionId
            )
        }
    }

    *createSubExpense(transactionId: string, amount: number) {
        const transaction: SystemTransaction | undefined =
            yield this.transactionService.getTransactionById(transactionId)
        if (!transaction) return

        const exchangeRate = transaction.referenceAmount / -transaction.amount
        const subTransaction: SystemSubTransaction =
            yield this.subTransactionService.add(
                {
                    ...pick(transaction, [
                        'time',
                        'description',
                        'currencyCode',
                        'referenceCurrencyCode',
                        'bankId',
                        'account',
                        'card',
                        'category',
                        'labels',
                    ]),
                    type: 'sub-expense',
                    id: crypto.randomUUID(),
                    parentId: transactionId,
                    amount: -toSmallestUnit(amount),
                    referenceAmount: toSmallestUnit(amount * exchangeRate),
                    capitalized: false,
                    hide: false,
                    comment: '',
                },
                transaction.amount
            )

        this.subTransactions.push(subTransaction)
    }

    *resetCategory(categoryId: string) {
        yield Promise.all([
            this.transactionService.resetCategory(categoryId),
            this.subTransactionService.resetCategory(categoryId),
        ])

        this.transactions = this.transactions.map((t) =>
            t.category === categoryId ? { ...t, category: '' } : t
        )
        this.subTransactions = this.subTransactions.map((s) =>
            s.category === categoryId ? { ...s, category: '' } : s
        )
    }

    *addTransaction(rawTransaction: RawSystemTransaction) {
        const transaction: SystemTransaction =
            yield this.transactionService.addTransaction(rawTransaction)

        this.transactions.push(transaction)
    }
}
