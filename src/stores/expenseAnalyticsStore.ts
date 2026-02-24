import { makeAutoObservable, reaction } from 'mobx'

import { RootStore } from './rootStore'
import { TransactionService } from '../db/services'
import { AnyTransaction } from '../types'
import { fromSmallestUnit } from '../utils/formatAmount'

export class ExpenseAnalyticsStore {
    private readonly root: RootStore
    private readonly transactionService: TransactionService

    loading = false
    error: string | null = null
    expenses: AnyTransaction[] = []

    selectedYear: number = new Date().getFullYear()

    constructor(root: RootStore, transactionService: TransactionService) {
        makeAutoObservable(this, {}, { autoBind: true })
        this.root = root
        this.transactionService = transactionService

        reaction(
            () => this.selectedYear,
            () => this.loadExpenses()
        )
    }

    get yearlyCategoryBreakdown(): Record<string, number[]> {
        const categoriesMap = this.root.expenseCategoryStore.categoriesMap

        return this.expenses.reduce(
            (acc, expense) => {
                const category =
                    categoriesMap[expense.category] ?? 'Uncategorized'

                if (acc[category] === undefined) {
                    acc[category] = Array(12).fill(0)
                }

                const refAmount = fromSmallestUnit(expense.referenceAmount)
                const month = new Date(expense.time).getMonth()

                if (acc[category][month] !== undefined) {
                    acc[category][month] += refAmount
                }

                return acc
            },
            {} as Record<string, number[]>
        )
    }

    setSelectedYear(year: number) {
        this.selectedYear = year
    }

    *loadExpenses() {
        this.loading = true
        this.error = null

        try {
            const startOfYear = new Date(this.selectedYear, 0, 1).getTime()
            const endOfYear =
                new Date(this.selectedYear + 1, 0, 1).getTime() - 1

            const expenses: AnyTransaction[] =
                yield this.transactionService.getExpensesByDateRange(
                    startOfYear,
                    endOfYear
                )

            this.expenses = expenses
        } catch (e) {
            this.error =
                e instanceof Error
                    ? e.message
                    : 'Failed to load expense analytics'
        } finally {
            this.loading = false
        }
    }
}
