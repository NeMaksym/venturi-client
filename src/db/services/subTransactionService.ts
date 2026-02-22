import { Stores } from '../schema'
import { DBProvider } from '../provider'
import { SubTransaction } from '../../types'
import { isValidUnixMillis } from '../../utils'

export class SubTransactionService {
    // TODO: Handle parent-related validations:
    //   - total amount should not exceed parent amount
    //   - types should correspond
    // TODO: Add source validation
    #validate(subTransaction: SubTransaction): void {
        if (!isValidUnixMillis(subTransaction.time)) {
            throw new Error('Time should be number in unix milliseconds')
        }

        if (subTransaction.type === 'sub-expense') {
            if (subTransaction.source.amount >= 0) {
                throw new Error('Sub-expense amount must be negative')
            }
        } else if (subTransaction.type === 'sub-income') {
            if (subTransaction.source.amount <= 0) {
                throw new Error('Sub-income amount must be positive')
            }
        } else {
            throw new Error('Invalid sub-transaction type')
        }

        if (subTransaction.referenceAmount <= 0) {
            throw new Error('Sub-transaction referenceAmount must be positive')
        }
    }

    async getAll(): Promise<SubTransaction[]> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.SUB_TRANSACTIONS, 'readonly')
        const store = tx.objectStore(Stores.SUB_TRANSACTIONS)

        try {
            return await store.getAll()
        } catch (error) {
            console.error('Failed to get all sub-transactions:', error)
            throw error
        }
    }

    async getByDateRange(
        startDate: Date,
        endDate: Date
    ): Promise<SubTransaction[]> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.SUB_TRANSACTIONS, 'readonly')
        const store = tx.objectStore(Stores.SUB_TRANSACTIONS)
        const timeIndex = store.index('time')

        try {
            const range = IDBKeyRange.bound(
                startDate.getTime(),
                endDate.getTime()
            )
            return await timeIndex.getAll(range)
        } catch (error) {
            console.error(
                'Failed to get sub-transactions by date range:',
                error
            )
            throw error
        }
    }

    async getByParentId(parentId: string): Promise<SubTransaction[]> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.SUB_TRANSACTIONS, 'readonly')
        const store = tx.objectStore(Stores.SUB_TRANSACTIONS)
        const parentIdIndex = store.index('parentId')

        try {
            return await parentIdIndex.getAll(parentId)
        } catch (error) {
            console.error('Failed to get sub-transactions by parent ID:', error)
            throw error
        }
    }

    async getByCategory(category: string): Promise<SubTransaction[]> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.SUB_TRANSACTIONS, 'readonly')
        const store = tx.objectStore(Stores.SUB_TRANSACTIONS)
        const categoryIndex = store.index('category')

        try {
            return await categoryIndex.getAll(category)
        } catch (error) {
            console.error('Failed to get sub-transactions by category:', error)
            throw error
        }
    }

    async getById(id: string): Promise<SubTransaction | undefined> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.SUB_TRANSACTIONS, 'readonly')
        const store = tx.objectStore(Stores.SUB_TRANSACTIONS)

        try {
            return await store.get(id)
        } catch (error) {
            console.error('Failed to get sub-transaction by ID:', error)
            throw error
        }
    }

    // TODO: Separate total sum validation
    async add(
        subTransaction: Omit<SubTransaction, 'createdAt' | 'updatedAt'>,
        parentAmount: number
    ): Promise<SubTransaction> {
        const now = Date.now()
        const subTransactionWithTimestamps: SubTransaction = {
            ...subTransaction,
            createdAt: now,
            updatedAt: now,
        }
        this.#validate(subTransactionWithTimestamps)

        const siblings = await this.getByParentId(subTransaction.parentId)
        const siblingSum = siblings.reduce(
            (sum, s) => sum + Math.abs(s.source.amount),
            0
        )
        if (
            siblingSum + Math.abs(subTransaction.source.amount) >
            Math.abs(parentAmount)
        ) {
            throw new Error(
                'Sum of sub-transactions cannot exceed parent amount'
            )
        }

        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.SUB_TRANSACTIONS, 'readwrite')
        const store = tx.objectStore(Stores.SUB_TRANSACTIONS)

        try {
            await store.add(subTransactionWithTimestamps)
            return subTransactionWithTimestamps
        } catch (error) {
            console.error('Failed to add sub-transaction:', error)
            throw error
        }
    }

    async update(subTransaction: SubTransaction): Promise<SubTransaction> {
        const updatedSubTransaction: SubTransaction = {
            ...subTransaction,
            updatedAt: Date.now(),
        }
        this.#validate(updatedSubTransaction)

        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.SUB_TRANSACTIONS, 'readwrite')
        const store = tx.objectStore(Stores.SUB_TRANSACTIONS)

        try {
            await store.put(updatedSubTransaction)
            return updatedSubTransaction
        } catch (error) {
            console.error('Failed to update sub-transaction:', error)
            throw error
        }
    }

    async delete(id: string): Promise<void> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.SUB_TRANSACTIONS, 'readwrite')
        const store = tx.objectStore(Stores.SUB_TRANSACTIONS)

        try {
            await store.delete(id)
        } catch (error) {
            console.error('Failed to delete sub-transaction:', error)
            throw error
        }
    }

    async resetCategory(category: string): Promise<void> {
        const subTransactions = await this.getByCategory(category)

        for (const subTransaction of subTransactions) {
            const updated = { ...subTransaction, category: '' }
            await this.update(updated)
        }
    }
}
