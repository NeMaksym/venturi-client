import { Stores } from '../schema'
import { DBProvider } from '../provider'
import { SystemTransaction } from '../../types'

export class ExpenseService {
    async expenseExists(expense: SystemTransaction): Promise<boolean> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.EXPENSES, 'readonly')
        const store = tx.objectStore(Stores.EXPENSES)
        const timeIndex = store.index('time')

        try {
            const expensesAtSameTime = await timeIndex.getAll(expense.time)
            return expensesAtSameTime.some(
                (dbExpense) =>
                    dbExpense.bank === expense.bank &&
                    dbExpense.amount === expense.amount
            )
        } catch (error) {
            console.error('Failed to check if expense exists:', error)
            throw error
        }
    }

    async getAllExpenses(): Promise<SystemTransaction[]> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.EXPENSES, 'readonly')
        const store = tx.objectStore(Stores.EXPENSES)

        try {
            return await store.getAll()
        } catch (error) {
            console.error('Failed to get all expenses:', error)
            throw error
        }
    }

    async getExpensesByDateRange(
        startDate: Date,
        endDate: Date
    ): Promise<SystemTransaction[]> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.EXPENSES, 'readonly')
        const store = tx.objectStore(Stores.EXPENSES)
        const timeIndex = store.index('time')

        try {
            const range = IDBKeyRange.bound(
                startDate.getTime(),
                endDate.getTime()
            )
            return await timeIndex.getAll(range)
        } catch (error) {
            console.error('Failed to get expenses by date range:', error)
            throw error
        }
    }

    async getExpensesByCategory(
        category: string
    ): Promise<SystemTransaction[]> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.EXPENSES, 'readonly')
        const store = tx.objectStore(Stores.EXPENSES)
        const categoryIndex = store.index('category')

        try {
            return await categoryIndex.getAll(category)
        } catch (error) {
            console.error('Failed to get expenses by category:', error)
            throw error
        }
    }

    async getExpenseById(id: string): Promise<SystemTransaction | undefined> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.EXPENSES, 'readonly')
        const store = tx.objectStore(Stores.EXPENSES)

        try {
            return await store.get(id)
        } catch (error) {
            console.error('Failed to get expense by id:', error)
            throw error
        }
    }

    async addExpense(expense: SystemTransaction): Promise<SystemTransaction> {
        if (expense.amount >= 0) {
            throw new Error('Expense amount must be negative')
        }
        if (expense.referenceAmount <= 0) {
            throw new Error('Expense referenceAmount must be positive')
        }
        if (expense.operation) {
            if (expense.operation.amount <= 0) {
                throw new Error('Expense operation amount must be positive')
            }
        }

        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.EXPENSES, 'readwrite')
        const store = tx.objectStore(Stores.EXPENSES)

        try {
            await store.add(expense)
            return expense
        } catch (error) {
            console.error('Failed to add expense:', error)
            throw error
        }
    }

    async updateExpense(
        expense: SystemTransaction
    ): Promise<SystemTransaction> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.EXPENSES, 'readwrite')
        const store = tx.objectStore(Stores.EXPENSES)

        try {
            await store.put(expense)
            return expense
        } catch (error) {
            console.error('Failed to update expense:', error)
            throw error
        }
    }

    async deleteExpense(id: string): Promise<void> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.EXPENSES, 'readwrite')
        const store = tx.objectStore(Stores.EXPENSES)

        try {
            await store.delete(id)
        } catch (error) {
            console.error('Failed to delete expense:', error)
            throw error
        }
    }

    async resetCategory(category: string): Promise<void> {
        const expenses = await this.getExpensesByCategory(category)

        for (const expense of expenses) {
            const updatedExpense = { ...expense, category: '' }
            await this.updateExpense(updatedExpense)
        }
    }
}
