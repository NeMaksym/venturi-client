import { Stores } from '../schema'
import { DBProvider } from '../provider'
import { AnyTransaction, BankSourceData, CashSourceData } from '../../types'
import {
    currency,
    isFourDigitString,
    isIBAN,
    isValidUnixMillis,
} from '../../utils'

type UpdatableFields = Pick<
    AnyTransaction,
    'category' | 'labels' | 'comment' | 'hide' | 'capitalized'
>

export class TransactionService {
    // --- Validation ---

    #validateType(transaction: AnyTransaction): void {
        if (transaction.type === 'expense') {
            if (transaction.source.amount >= 0) {
                throw new Error('Expense amount must be negative')
            }
        } else if (transaction.type === 'income') {
            if (transaction.source.amount <= 0) {
                throw new Error('Income amount must be positive')
            }
        } else {
            throw new Error('Invalid transaction type')
        }
    }

    #validateBankSource(source: BankSourceData): void {
        if (!currency.numToAlpha(source.currencyCode)) {
            throw new Error('Invalid currency code')
        }

        if (!source.account && !source.card) {
            throw new Error('Bank transaction should have account and/or card')
        }

        if (source.account) {
            switch (source.account.type) {
                case 'iban':
                    if (!isIBAN(source.account.value)) {
                        throw new Error('Invalid IBAN')
                    }
            }
        }

        if (source.card) {
            switch (source.card.type) {
                case 'lastFour':
                    if (!isFourDigitString(source.card.value)) {
                        throw new Error('Invalid last four digits')
                    }
            }
        }

        if (source.operation) {
            if (source.operation.amount <= 0) {
                throw new Error('Transaction operation amount must be positive')
            }
            if (!currency.numToAlpha(source.operation.currencyCode)) {
                throw new Error('Invalid operation currency code')
            }
        }
    }

    #validateCashSource(source: CashSourceData): void {
        if (!currency.numToAlpha(source.currencyCode)) {
            throw new Error('Invalid currency code')
        }
    }

    #validateSource(source: AnyTransaction['source']): void {
        switch (source.type) {
            case 'bank':
                this.#validateBankSource(source)
                break
            case 'cash':
                this.#validateCashSource(source)
                break
        }
    }

    #validateTransaction(transaction: AnyTransaction): void {
        this.#validateType(transaction)

        if (!isValidUnixMillis(transaction.time)) {
            throw new Error('Time should be number in unix milliseconds')
        }

        if (transaction.referenceAmount <= 0) {
            throw new Error('Transaction referenceAmount must be positive')
        }

        this.#validateSource(transaction.source)
    }

    #validateParentTransaction(transaction: AnyTransaction): void {
        this.#validateTransaction(transaction)

        if (transaction.parentId) {
            throw new Error('Parent transaction must not have parentId')
        }
    }

    #validateChildTransaction(transaction: AnyTransaction): void {
        this.#validateTransaction(transaction)

        if (!transaction.parentId) {
            throw new Error('Child transaction must have parentId')
        }
    }

    // --- Read ---

    async getAllTransactions(): Promise<AnyTransaction[]> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.TRANSACTIONS, 'readonly')
        const store = tx.objectStore(Stores.TRANSACTIONS)

        try {
            return await store.getAll()
        } catch (error) {
            console.error('Failed to get all transactions:', error)
            throw error
        }
    }

    // null if no transactions
    async getEarliestTransactionTime(): Promise<number | null> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.TRANSACTIONS, 'readonly')
        const index = tx.objectStore(Stores.TRANSACTIONS).index('time')

        try {
            const cursor = await index.openCursor()
            return cursor ? cursor.value.time : null
        } catch (error) {
            console.error('Failed to get earliest transaction time:', error)
            throw error
        }
    }

    async getTransactionsByDateRange(
        startTime: number,
        endTime: number
    ): Promise<AnyTransaction[]> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.TRANSACTIONS, 'readonly')
        const index = tx.objectStore(Stores.TRANSACTIONS).index('time')

        try {
            return await index.getAll(IDBKeyRange.bound(startTime, endTime))
        } catch (error) {
            console.error('Failed to get transactions by date range:', error)
            throw error
        }
    }

    async getExpensesByDateRange(
        startTime: number,
        endTime: number
    ): Promise<AnyTransaction[]> {
        const transactions = await this.getTransactionsByDateRange(
            startTime,
            endTime
        )
        return transactions.filter((t) => t.type === 'expense')
    }

    async getTransactionById(id: string): Promise<AnyTransaction | undefined> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.TRANSACTIONS, 'readonly')
        const store = tx.objectStore(Stores.TRANSACTIONS)

        try {
            return await store.get(id)
        } catch (error) {
            console.error('Failed to get transaction by id:', error)
            throw error
        }
    }

    async getByParentId(parentId: string): Promise<AnyTransaction[]> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.TRANSACTIONS, 'readonly')
        const store = tx.objectStore(Stores.TRANSACTIONS)
        const parentIdIndex = store.index('parentId')

        try {
            return await parentIdIndex.getAll(parentId)
        } catch (error) {
            console.error('Failed to get transactions by parent ID:', error)
            throw error
        }
    }

    // --- Dedup ---

    async transactionExists(
        transaction:
            | AnyTransaction
            | Omit<AnyTransaction, 'createdAt' | 'updatedAt'>
    ): Promise<boolean> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.TRANSACTIONS, 'readonly')
        const store = tx.objectStore(Stores.TRANSACTIONS)
        const timeIndex = store.index('time')

        try {
            const transactionsAtSameTime = await timeIndex.getAll(
                transaction.time
            )
            return transactionsAtSameTime.some((dbTransaction) => {
                switch (transaction.source.type) {
                    case 'bank':
                        return (
                            dbTransaction.source.type === 'bank' &&
                            dbTransaction.source.bankId ===
                                transaction.source.bankId &&
                            dbTransaction.source.amount ===
                                transaction.source.amount &&
                            dbTransaction.source.currencyCode ===
                                transaction.source.currencyCode
                        )
                    case 'cash':
                        return (
                            dbTransaction.source.type === 'cash' &&
                            dbTransaction.source.currencyCode ===
                                transaction.source.currencyCode &&
                            dbTransaction.source.amount ===
                                transaction.source.amount &&
                            dbTransaction.description ===
                                transaction.description
                        )
                }
            })
        } catch (error) {
            console.error('Failed to check if transaction exists:', error)
            throw error
        }
    }

    // --- Add ---

    async addParentTransaction(
        transaction: Omit<AnyTransaction, 'createdAt' | 'updatedAt'>
    ): Promise<AnyTransaction> {
        const transactionWithTimestamps: AnyTransaction = {
            ...transaction,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        }

        this.#validateParentTransaction(transactionWithTimestamps)

        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.TRANSACTIONS, 'readwrite')
        const store = tx.objectStore(Stores.TRANSACTIONS)

        try {
            await store.add(transactionWithTimestamps)
            return transactionWithTimestamps
        } catch (error) {
            console.error('Failed to add transaction:', error)
            throw error
        }
    }

    // TODO: Validate parent exists
    // TODO: Validate sum constraint
    async addChildTransaction(
        subTransaction: Omit<AnyTransaction, 'createdAt' | 'updatedAt'>
    ): Promise<AnyTransaction> {
        const subTransactionWithTimestamps: AnyTransaction = {
            ...subTransaction,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        }

        this.#validateChildTransaction(subTransactionWithTimestamps)

        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.TRANSACTIONS, 'readwrite')
        const store = tx.objectStore(Stores.TRANSACTIONS)

        try {
            await store.add(subTransactionWithTimestamps)
            return subTransactionWithTimestamps
        } catch (error) {
            console.error('Failed to add sub-transaction:', error)
            throw error
        }
    }

    // --- Update (whitelisted fields) ---

    async updateParentTransaction(
        id: string,
        updates: Partial<UpdatableFields>
    ): Promise<AnyTransaction> {
        const existing = await this.getTransactionById(id)
        if (!existing) {
            throw new Error(`Transaction not found: ${id}`)
        }

        const updated: AnyTransaction = {
            ...existing,
            ...updates,
            updatedAt: Date.now(),
        }

        this.#validateParentTransaction(updated)

        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.TRANSACTIONS, 'readwrite')
        const store = tx.objectStore(Stores.TRANSACTIONS)

        try {
            await store.put(updated)
            return updated
        } catch (error) {
            console.error('Failed to update transaction:', error)
            throw error
        }
    }

    async updateChildTransaction(
        id: string,
        updates: Partial<UpdatableFields>
    ): Promise<AnyTransaction> {
        const existing = await this.getTransactionById(id)
        if (!existing) {
            throw new Error(`Sub-transaction not found: ${id}`)
        }
        if (existing.parentId === null) {
            throw new Error(
                'Cannot use updateChildTransaction on a parent transaction'
            )
        }

        const updated: AnyTransaction = {
            ...existing,
            ...updates,
            updatedAt: Date.now(),
        }

        this.#validateChildTransaction(updated)

        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.TRANSACTIONS, 'readwrite')
        const store = tx.objectStore(Stores.TRANSACTIONS)

        try {
            await store.put(updated)
            return updated
        } catch (error) {
            console.error('Failed to update sub-transaction:', error)
            throw error
        }
    }

    // --- Delete ---

    async deleteParentTransaction(id: string): Promise<void> {
        const db = await DBProvider.instance.db

        const children = await this.getByParentId(id)

        const tx = db.transaction(Stores.TRANSACTIONS, 'readwrite')
        const store = tx.objectStore(Stores.TRANSACTIONS)

        try {
            await Promise.all([
                ...children.map((child) => store.delete(child.id)),
                store.delete(id),
            ])
            await tx.done
        } catch (error) {
            console.error('Failed to delete transaction:', error)
            throw error
        }
    }

    async deleteChildTransaction(id: string): Promise<void> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.TRANSACTIONS, 'readwrite')
        const store = tx.objectStore(Stores.TRANSACTIONS)

        try {
            await store.delete(id)
        } catch (error) {
            console.error('Failed to delete sub-transaction:', error)
            throw error
        }
    }

    // --- Category ---

    async resetCategory(categoryId: string): Promise<void> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.TRANSACTIONS, 'readwrite')
        const store = tx.objectStore(Stores.TRANSACTIONS)
        const categoryIndex = store.index('category')

        try {
            const transactions = await categoryIndex.getAll(categoryId)

            for (const transaction of transactions) {
                const updatedTransaction = {
                    ...transaction,
                    category: '' as const,
                    updatedAt: Date.now(),
                }
                await store.put(updatedTransaction)
            }

            await tx.done
        } catch (error) {
            console.error('Failed to reset transaction category:', error)
            throw error
        }
    }
}
