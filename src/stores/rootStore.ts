import {
    ExpenseCategoryService,
    TransactionService,
    SubExpenseService,
} from '../db/services'
import { ExpenseFilterStore } from './expenseFilterStore'
import { ExpenseCategoryStore } from './expenseCategoryStore'
import { TransactionStore } from './transactionStore'
import { UiStore } from './uiStore'

export class RootStore {
    uiStore: UiStore
    expenseFilterStore: ExpenseFilterStore
    expenseCategoryStore: ExpenseCategoryStore
    transactionStore: TransactionStore

    constructor() {
        this.uiStore = new UiStore()

        this.expenseFilterStore = new ExpenseFilterStore(this)

        const categoryService = new ExpenseCategoryService()
        this.expenseCategoryStore = new ExpenseCategoryStore(categoryService)

        const transactionService = new TransactionService()
        const subExpenseService = new SubExpenseService()
        this.transactionStore = new TransactionStore(
            this,
            transactionService,
            subExpenseService
        )
    }
}
