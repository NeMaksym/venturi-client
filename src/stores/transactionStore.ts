import { pick } from 'lodash'
import { makeAutoObservable } from 'mobx'

import { RootStore } from './rootStore'
import { toSmallestUnit, timeDesc } from '../utils'
import { TransactionService, SubExpenseService } from '../db/services'
import {
    SystemTransaction,
    SystemSubTransaction,
    RawSystemTransaction,
} from '../types'

type SubExpensesMap = Map<string, SystemSubTransaction[]>

export class TransactionStore {
    private readonly root: RootStore
    private readonly transactionService: TransactionService
    private readonly subExpenseService: SubExpenseService

    loading = false
    error: string | null = null
    transactions: SystemTransaction[] = []
    subExpenses: SystemSubTransaction[] = []

    get allExpenses() {
        return this.transactions.filter((t) => t.type === 'expense')
    }

    get allIncomes() {
        return this.transactions.filter((t) => t.type === 'income')
    }

    async transactionExists(
        transaction: SystemTransaction | RawSystemTransaction
    ): Promise<boolean> {
        return await this.transactionService.transactionExists(transaction)
    }

    constructor(
        root: RootStore,
        transactionService: TransactionService,
        subExpenseService: SubExpenseService
    ) {
        makeAutoObservable(this, {}, { autoBind: true })
        this.root = root
        this.transactionService = transactionService
        this.subExpenseService = subExpenseService
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

    getSubExpensesInDateRange(startDate: number, endDate: number) {
        return this.subExpenses.filter((subExpense) => {
            return subExpense.time >= startDate && subExpense.time <= endDate
        })
    }

    getSubExpensesMapInDateRange(startDate: number, endDate: number) {
        return this.getSubExpensesInDateRange(startDate, endDate)
            .slice()
            .sort(timeDesc)
            .reduce<SubExpensesMap>((acc, subExpense) => {
                const subExpenses = acc.get(subExpense.parentId) || []
                subExpenses.push(subExpense)
                acc.set(subExpense.parentId, subExpenses)
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

    get subExpensesInDateRange() {
        const filters = this.root.expenseFilterStore
        return this.subExpenses.filter((subExpense) => {
            return (
                subExpense.time >= filters.unixStartDate &&
                subExpense.time <= filters.unixEndDate
            )
        })
    }

    get subExpensesMapInDateRange() {
        return this.subExpensesInDateRange
            .slice()
            .sort(timeDesc)
            .reduce<SubExpensesMap>((acc, subExpense) => {
                const subExpenses = acc.get(subExpense.parentId) || []
                subExpenses.push(subExpense)
                acc.set(subExpense.parentId, subExpenses)
                return acc
            }, new Map())
    }

    *loadAll() {
        this.loading = true
        this.error = null

        try {
            const [transactions, subExpenses]: [
                SystemTransaction[],
                SystemSubTransaction[],
            ] = yield Promise.all([
                this.transactionService.getAllTransactions(),
                this.subExpenseService.getAllSubExpenses(),
            ])

            this.transactions = transactions
            this.subExpenses = subExpenses
        } catch (e) {
            this.error =
                e instanceof Error ? e.message : 'Failed to load transactions'
        } finally {
            this.loading = false
        }
    }

    *updateField(
        transactionId: string,
        updates: Partial<SystemTransaction> | Partial<SystemSubTransaction>,
        subTransactionId?: string
    ) {
        if (subTransactionId) {
            const sub: SystemSubTransaction | undefined =
                yield this.subExpenseService.getSubExpenseById(subTransactionId)
            if (!sub) return

            const updated: SystemSubTransaction =
                yield this.subExpenseService.updateSubExpense({
                    ...sub,
                    ...updates,
                })

            this.subExpenses = this.subExpenses.map((s) =>
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

    *delete(transactionId: string, subExpenseId?: string) {
        if (subExpenseId) {
            yield this.subExpenseService.deleteSubExpense(subExpenseId)

            this.subExpenses = this.subExpenses.filter(
                (s) => s.id !== subExpenseId
            )
        } else {
            const relatedSubExpenses = this.subExpenses.filter(
                (s) => s.parentId === transactionId
            )

            yield Promise.all([
                ...relatedSubExpenses.map((sub) =>
                    this.subExpenseService.deleteSubExpense(sub.id)
                ),
                this.transactionService.deleteTransaction(transactionId),
            ])

            this.transactions = this.transactions.filter(
                (t) => t.id !== transactionId
            )
            this.subExpenses = this.subExpenses.filter(
                (s) => s.parentId !== transactionId
            )
        }
    }

    *createSubExpense(transactionId: string, amount: number) {
        const transaction: SystemTransaction | undefined =
            yield this.transactionService.getTransactionById(transactionId)
        if (!transaction) return

        const exchangeRate = transaction.referenceAmount / -transaction.amount
        const subExpense: SystemSubTransaction =
            yield this.subExpenseService.addSubExpense({
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
                id: crypto.randomUUID(),
                parentId: transactionId,
                amount: -toSmallestUnit(amount),
                referenceAmount: toSmallestUnit(amount * exchangeRate),
                capitalized: false,
                hide: false,
                comment: '',
            })

        this.subExpenses.push(subExpense)
    }

    *resetCategory(categoryId: string) {
        yield Promise.all([
            this.transactionService.resetCategory(categoryId),
            this.subExpenseService.resetCategory(categoryId),
        ])

        this.transactions = this.transactions.map((t) =>
            t.category === categoryId ? { ...t, category: '' } : t
        )
        this.subExpenses = this.subExpenses.map((s) =>
            s.category === categoryId ? { ...s, category: '' } : s
        )
    }

    *addTransaction(rawTransaction: RawSystemTransaction) {
        const transaction: SystemTransaction =
            yield this.transactionService.addTransaction(rawTransaction)

        this.transactions.push(transaction)
    }
}
