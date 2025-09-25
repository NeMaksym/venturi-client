import { pick } from 'lodash'
import { makeAutoObservable } from 'mobx'

import { RootStore } from './rootStore'
import { toSmallestUnit, timeDesc } from '../utils'
import { ExpenseService, SubExpenseService } from '../db/services'
import {
    SystemTransaction,
    SystemSubTransaction,
    RawSystemTransaction,
} from '../types'

type SubExpensesMap = Map<string, SystemSubTransaction[]>

export class ExpenseStore {
    private readonly root: RootStore
    private readonly expenseService: ExpenseService
    private readonly subExpenseService: SubExpenseService

    loading = false
    error: string | null = null
    expenses: SystemTransaction[] = []
    subExpenses: SystemSubTransaction[] = []

    async expenseExists(
        expense: SystemTransaction | RawSystemTransaction
    ): Promise<boolean> {
        return await this.expenseService.expenseExists(expense)
    }

    constructor(
        root: RootStore,
        expenseService: ExpenseService,
        subExpenseService: SubExpenseService
    ) {
        makeAutoObservable(this, {}, { autoBind: true })
        this.root = root
        this.expenseService = expenseService
        this.subExpenseService = subExpenseService
    }

    get expensesInDateRange() {
        return this.expenses.filter((expense) => {
            return (
                expense.time >= this.root.expenseFilterStore.unixStartDate &&
                expense.time <= this.root.expenseFilterStore.unixEndDate
            )
        })
    }

    get subExpensesInDateRange() {
        return this.subExpenses.filter((subExpense) => {
            return (
                subExpense.time >= this.root.expenseFilterStore.unixStartDate &&
                subExpense.time <= this.root.expenseFilterStore.unixEndDate
            )
        })
    }

    get subExpensesInDateRangeMap() {
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
            const [expenses, subExpenses]: [
                SystemTransaction[],
                SystemSubTransaction[]
            ] = yield Promise.all([
                this.expenseService.getAllExpenses(),
                this.subExpenseService.getAllSubExpenses(),
            ])

            this.expenses = expenses
            this.subExpenses = subExpenses
        } catch (e) {
            this.error =
                e instanceof Error ? e.message : 'Failed to load expenses'
        } finally {
            this.loading = false
        }
    }

    *updateExpenseField(
        expenseId: string,
        updates: Partial<SystemTransaction>
    ) {
        const expense: SystemTransaction | undefined =
            yield this.expenseService.getExpenseById(expenseId)
        if (!expense) return

        const updated: SystemTransaction =
            yield this.expenseService.updateExpense({
                ...expense,
                ...updates,
            })

        this.expenses = this.expenses.map((e) =>
            e.id === expenseId ? updated : e
        )
    }

    *updateSubExpenseField(
        subExpenseId: string,
        updates: Partial<SystemSubTransaction>
    ) {
        const sub: SystemSubTransaction | undefined =
            yield this.subExpenseService.getSubExpenseById(subExpenseId)
        if (!sub) return

        const updated: SystemSubTransaction =
            yield this.subExpenseService.updateSubExpense({
                ...sub,
                ...updates,
            })

        this.subExpenses = this.subExpenses.map((s) =>
            s.id === subExpenseId ? updated : s
        )
    }

    *delete(expenseId: string, subExpenseId?: string) {
        if (subExpenseId) {
            yield this.subExpenseService.deleteSubExpense(subExpenseId)

            this.subExpenses = this.subExpenses.filter(
                (s) => s.id !== subExpenseId
            )
        } else {
            yield this.expenseService.deleteExpense(expenseId)

            this.expenses = this.expenses.filter((e) => e.id !== expenseId)
        }
    }

    *createSubTransaction(expenseId: string, amount: number) {
        const expense: SystemTransaction | undefined =
            yield this.expenseService.getExpenseById(expenseId)
        if (!expense) return

        const exchangeRate = expense.referenceAmount / -expense.amount
        const subExpense: SystemSubTransaction =
            yield this.subExpenseService.addSubExpense({
                ...pick(expense, [
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
                parentId: expenseId,
                amount: -toSmallestUnit(amount),
                referenceAmount: toSmallestUnit(amount * exchangeRate),
                capitalized: false,
                hide: false,
                comment: '',
            })

        this.subExpenses.push(subExpense)
    }

    *resetCategory(categoryId: string) {
        yield this.expenseService.resetCategory(categoryId)
        yield this.subExpenseService.resetCategory(categoryId)

        this.expenses = this.expenses.map((e) =>
            e.category === categoryId ? { ...e, category: '' } : e
        )
        this.subExpenses = this.subExpenses.map((s) =>
            s.category === categoryId ? { ...s, category: '' } : s
        )
    }

    *addExpense(rawExpense: RawSystemTransaction) {
        const expense: SystemTransaction = yield this.expenseService.addExpense(
            rawExpense
        )

        this.expenses.push(expense)
    }
}
