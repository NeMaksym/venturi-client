import { DBProvider } from '../provider'
import { Stores } from '../schema'
import { SystemTransaction } from '../../types'

export class IncomeService {
    async transactionExists(transaction: SystemTransaction): Promise<boolean> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.INCOMES, 'readonly')
        const store = tx.objectStore(Stores.INCOMES)
        const timeIndex = store.index('time')

        try {
            const transactionsAtSameTime = await timeIndex.getAll(
                transaction.time
            )

            return transactionsAtSameTime.some(
                (dbTransaction) =>
                    dbTransaction.bank === transaction.bank &&
                    dbTransaction.amount === transaction.amount
            )
        } catch (error) {
            console.error('Failed to check if transaction exists:', error)
            throw error
        }
    }

    async addIncome(income: SystemTransaction): Promise<SystemTransaction> {
        if (income.amount <= 0) {
            throw new Error('Income amount must be positive')
        }

        if (income.referenceAmount <= 0) {
            throw new Error('Income referenceAmount must be positive')
        }

        if (income.operation) {
            if (income.operation.amount <= 0) {
                throw new Error('Income operation amount must be positive')
            }
        }

        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.INCOMES, 'readwrite')
        const store = tx.objectStore(Stores.INCOMES)

        try {
            await store.add(income)
            return income
        } catch (error) {
            console.error('Failed to add income:', error)
            throw error
        }
    }

    async getAllIncomes(): Promise<SystemTransaction[]> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.INCOMES, 'readonly')
        const store = tx.objectStore(Stores.INCOMES)

        try {
            return await store.getAll()
        } catch (error) {
            console.error('Failed to get all incomes:', error)
            throw error
        }
    }

    async getIncomesByDateRange(
        startDate: Date,
        endDate: Date
    ): Promise<SystemTransaction[]> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.INCOMES, 'readonly')
        const store = tx.objectStore(Stores.INCOMES)
        const timeIndex = store.index('time')

        try {
            const range = IDBKeyRange.bound(
                startDate.getTime(),
                endDate.getTime()
            )
            return await timeIndex.getAll(range)
        } catch (error) {
            console.error('Failed to get incomes by date range:', error)
            throw error
        }
    }

    async getIncomeById(id: string): Promise<SystemTransaction | undefined> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.INCOMES, 'readonly')
        const store = tx.objectStore(Stores.INCOMES)

        try {
            return await store.get(id)
        } catch (error) {
            console.error('Failed to get income by id:', error)
            throw error
        }
    }

    async updateIncome(income: SystemTransaction): Promise<SystemTransaction> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.INCOMES, 'readwrite')
        const store = tx.objectStore(Stores.INCOMES)

        try {
            await store.put(income)
            return income
        } catch (error) {
            console.error('Failed to update income:', error)
            throw error
        }
    }

    async deleteIncome(id: string): Promise<void> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.INCOMES, 'readwrite')
        const store = tx.objectStore(Stores.INCOMES)

        try {
            await store.delete(id)
        } catch (error) {
            console.error('Failed to delete income:', error)
            throw error
        }
    }
}
