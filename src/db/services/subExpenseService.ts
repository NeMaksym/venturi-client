import { Stores } from '../schema'
import { DBProvider } from '../provider'
import { SystemSubTransaction } from '../../types'

export class SubExpenseService {
    async getAllSubExpenses(): Promise<SystemSubTransaction[]> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.SUB_EXPENSES, 'readonly')
        const store = tx.objectStore(Stores.SUB_EXPENSES)

        try {
            return await store.getAll()
        } catch (error) {
            console.error('Failed to get all sub-expenses:', error)
            throw error
        }
    }

    async getSubExpensesByDateRange(
        startDate: Date,
        endDate: Date
    ): Promise<SystemSubTransaction[]> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.SUB_EXPENSES, 'readonly')
        const store = tx.objectStore(Stores.SUB_EXPENSES)
        const timeIndex = store.index('time')

        try {
            const range = IDBKeyRange.bound(
                startDate.getTime(),
                endDate.getTime()
            )
            return await timeIndex.getAll(range)
        } catch (error) {
            console.error('Failed to get sub-expenses by date range:', error)
            throw error
        }
    }

    async getSubExpensesByParentId(
        parentId: string
    ): Promise<SystemSubTransaction[]> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.SUB_EXPENSES, 'readonly')
        const store = tx.objectStore(Stores.SUB_EXPENSES)
        const parentIdIndex = store.index('parentId')

        try {
            return await parentIdIndex.getAll(parentId)
        } catch (error) {
            console.error('Failed to get sub-expenses by parent ID:', error)
            throw error
        }
    }

    async getSubExpensesByCategory(
        category: string
    ): Promise<SystemSubTransaction[]> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.SUB_EXPENSES, 'readonly')
        const store = tx.objectStore(Stores.SUB_EXPENSES)
        const categoryIndex = store.index('category')

        try {
            return await categoryIndex.getAll(category)
        } catch (error) {
            console.error('Failed to get sub-expenses by category:', error)
            throw error
        }
    }

    async getSubExpenseById(
        id: string
    ): Promise<SystemSubTransaction | undefined> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.SUB_EXPENSES, 'readonly')
        const store = tx.objectStore(Stores.SUB_EXPENSES)

        try {
            return await store.get(id)
        } catch (error) {
            console.error('Failed to get sub-expense by ID:', error)
            throw error
        }
    }

    async addSubExpense(
        subExpense: SystemSubTransaction
    ): Promise<SystemSubTransaction> {
        if (subExpense.amount >= 0) {
            throw new Error('Sub-expense amount must be negative')
        }
        if (subExpense.referenceAmount <= 0) {
            throw new Error('Sub-expense referenceAmount must be positive')
        }
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.SUB_EXPENSES, 'readwrite')
        const store = tx.objectStore(Stores.SUB_EXPENSES)

        try {
            await store.add(subExpense)
            return subExpense
        } catch (error) {
            console.error('Failed to add sub-expense:', error)
            throw error
        }
    }

    async updateSubExpense(
        subExpense: SystemSubTransaction
    ): Promise<SystemSubTransaction> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.SUB_EXPENSES, 'readwrite')
        const store = tx.objectStore(Stores.SUB_EXPENSES)

        try {
            await store.put(subExpense)
            return subExpense
        } catch (error) {
            console.error('Failed to update sub-expense:', error)
            throw error
        }
    }

    async deleteSubExpense(id: string): Promise<void> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.SUB_EXPENSES, 'readwrite')
        const store = tx.objectStore(Stores.SUB_EXPENSES)

        try {
            await store.delete(id)
        } catch (error) {
            console.error('Failed to delete sub-expense:', error)
            throw error
        }
    }

    async resetCategory(category: string): Promise<void> {
        const subExpenses = await this.getSubExpensesByCategory(category)

        for (const subExpense of subExpenses) {
            const updatedSubExpense = { ...subExpense, category: '' }
            await this.updateSubExpense(updatedSubExpense)
        }
    }
}
