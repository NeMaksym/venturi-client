import { ExpenseCategoryService, TransactionService } from '../db/services'
import { ExpenseFilterStore } from './expenseFilterStore'
import { ExpenseCategoryStore } from './expenseCategoryStore'
import { ExpenseAnalyticsStore } from './expenseAnalyticsStore'
import { TransactionStore } from './transactionStore'
import { UiStore } from './uiStore'

export class RootStore {
    uiStore: UiStore
    expenseFilterStore: ExpenseFilterStore
    expenseCategoryStore: ExpenseCategoryStore
    expenseAnalyticsStore: ExpenseAnalyticsStore
    transactionStore: TransactionStore

    constructor() {
        const categoryService = new ExpenseCategoryService()
        const transactionService = new TransactionService()

        this.uiStore = new UiStore()
        this.expenseFilterStore = new ExpenseFilterStore(this)
        this.expenseCategoryStore = new ExpenseCategoryStore(categoryService)
        this.transactionStore = new TransactionStore(this, transactionService)
        this.expenseAnalyticsStore = new ExpenseAnalyticsStore(
            this,
            transactionService
        )
    }
}
