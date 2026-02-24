import { makeAutoObservable, reaction } from 'mobx'

import { RootStore } from './rootStore'
import { TransactionService } from '../db/services'
import { AnyTransaction } from '../types'
import { fromSmallestUnit } from '../utils/formatAmount'

export class ExpenseAnalyticsStore {
    private readonly root: RootStore
    private readonly transactionService: TransactionService

    // --- Yearly chart state ---
    yearlySelectedYear: number = new Date().getFullYear()
    yearlyExpenses: AnyTransaction[] = []
    yearlyLoading = false
    yearlyError: string | null = null

    // --- Monthly chart state ---
    monthlySelectedYear: number = new Date().getFullYear()
    monthlySelectedMonth: number = new Date().getMonth()
    monthlyExpenses: AnyTransaction[] = []
    monthlyLoading = false
    monthlyError: string | null = null

    // --- Shared ---
    earliestYear: number = new Date().getFullYear()

    constructor(root: RootStore, transactionService: TransactionService) {
        makeAutoObservable(this, {}, { autoBind: true })
        this.root = root
        this.transactionService = transactionService

        reaction(
            () => this.yearlySelectedYear,
            () => this.loadYearlyExpenses()
        )

        reaction(
            () => [this.monthlySelectedYear, this.monthlySelectedMonth],
            () => this.loadMonthlyExpenses()
        )
    }

    // --- Yearly computed ---

    get yearlyCategoryBreakdown(): Record<string, number[]> {
        const categoriesMap = this.root.expenseCategoryStore.categoriesMap

        return this.yearlyExpenses
            .filter((expense) => !expense.hide)
            .reduce(
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

    // --- Monthly computed ---

    get monthlyCategoryBreakdown(): { label: string; value: number }[] {
        const categoriesMap = this.root.expenseCategoryStore.categoriesMap
        const totals: Record<string, number> = {}

        for (const expense of this.monthlyExpenses) {
            if (expense.hide) continue

            const category = categoriesMap[expense.category] ?? 'Uncategorized'
            const refAmount = fromSmallestUnit(expense.referenceAmount)
            totals[category] = (totals[category] ?? 0) + refAmount
        }

        return Object.entries(totals).map(([label, value]) => ({
            label,
            value,
        }))
    }

    // --- Actions ---

    setYearlySelectedYear(year: number) {
        this.yearlySelectedYear = year
    }

    setMonthlySelectedYear(year: number) {
        this.monthlySelectedYear = year
    }

    setMonthlySelectedMonth(month: number) {
        this.monthlySelectedMonth = month
    }

    // --- Computed ---

    get availableYears(): number[] {
        const currentYear = new Date().getFullYear()
        const years: number[] = []
        for (let y = currentYear; y >= this.earliestYear; y--) {
            years.push(y)
        }
        return years
    }

    // --- Data loading ---

    *loadEarliestYear() {
        const earliest: number | null =
            yield this.transactionService.getEarliestTransactionTime()
        if (earliest) {
            this.earliestYear = new Date(earliest).getFullYear()
        }
    }

    *loadYearlyExpenses() {
        this.yearlyLoading = true
        this.yearlyError = null

        try {
            const startOfYear = new Date(
                this.yearlySelectedYear,
                0,
                1
            ).getTime()
            const endOfYear =
                new Date(this.yearlySelectedYear + 1, 0, 1).getTime() - 1

            const expenses: AnyTransaction[] =
                yield this.transactionService.getExpensesByDateRange(
                    startOfYear,
                    endOfYear
                )

            this.yearlyExpenses = expenses
        } catch (e) {
            this.yearlyError =
                e instanceof Error
                    ? e.message
                    : 'Failed to load yearly expenses'
        } finally {
            this.yearlyLoading = false
        }
    }

    *loadMonthlyExpenses() {
        this.monthlyLoading = true
        this.monthlyError = null

        try {
            const startOfMonth = new Date(
                this.monthlySelectedYear,
                this.monthlySelectedMonth,
                1
            ).getTime()
            const endOfMonth =
                new Date(
                    this.monthlySelectedYear,
                    this.monthlySelectedMonth + 1,
                    1
                ).getTime() - 1

            const expenses: AnyTransaction[] =
                yield this.transactionService.getExpensesByDateRange(
                    startOfMonth,
                    endOfMonth
                )

            this.monthlyExpenses = expenses
        } catch (e) {
            this.monthlyError =
                e instanceof Error
                    ? e.message
                    : 'Failed to load monthly expenses'
        } finally {
            this.monthlyLoading = false
        }
    }
}
