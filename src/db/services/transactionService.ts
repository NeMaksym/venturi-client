import { Stores } from '../schema'
import { DBProvider } from '../provider'
import { RawTransaction, Transaction } from '../../types'
import {
    currency,
    isFourDigitString,
    isIBAN,
    isValidUnixMillis,
} from '../../utils'

export class TransactionService {
    #validateTransaction(transaction: Transaction): void {
        if (!isValidUnixMillis(transaction.time)) {
            throw new Error('Time should be number in unix milliseconds')
        }
        if (!currency.numToAlpha(transaction.currencyCode)) {
            throw new Error('Invalid currency code')
        }

        if (transaction.type === 'expense') {
            if (transaction.amount >= 0) {
                throw new Error('Expense amount must be negative')
            }
        } else if (transaction.type === 'income') {
            if (transaction.amount <= 0) {
                throw new Error('Income amount must be positive')
            }
        } else {
            throw new Error('Invalid transaction type')
        }

        if (transaction.referenceAmount <= 0) {
            throw new Error('Transaction referenceAmount must be positive')
        }

        if (transaction.operation) {
            if (transaction.operation.amount <= 0) {
                throw new Error('Transaction operation amount must be positive')
            }
            if (!currency.numToAlpha(transaction.operation.currencyCode)) {
                throw new Error('Invalid operation currency code')
            }
        }
        if (!('account' in transaction) && !('card' in transaction)) {
            throw new Error('Transaction should have account and/or card')
        }
        if ('account' in transaction) {
            if (!isIBAN(transaction.account.value)) {
                throw new Error('Invalid IBAN')
            }
        }
        if ('card' in transaction) {
            if (!isFourDigitString(transaction.card.value)) {
                throw new Error('Invalid last four digits')
            }
        }
    }

    async transactionExists(
        transaction: Transaction | RawTransaction
    ): Promise<boolean> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.TRANSACTIONS, 'readonly')
        const store = tx.objectStore(Stores.TRANSACTIONS)
        const timeIndex = store.index('time')

        try {
            const transactionsAtSameTime = await timeIndex.getAll(
                transaction.time
            )
            return transactionsAtSameTime.some(
                (dbTransaction) =>
                    dbTransaction.bankId === transaction.bankId &&
                    dbTransaction.amount === transaction.amount
            )
        } catch (error) {
            console.error('Failed to check if transaction exists:', error)
            throw error
        }
    }

    async getAllTransactions(): Promise<Transaction[]> {
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

    async getTransactionById(id: string): Promise<Transaction | undefined> {
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

    async addTransaction(transaction: RawTransaction): Promise<Transaction> {
        const transactionWithTimestamps: Transaction = {
            ...transaction,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        }

        this.#validateTransaction(transactionWithTimestamps)

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

    async updateTransaction(transaction: Transaction): Promise<Transaction> {
        const updatedTransaction: Transaction = {
            ...transaction,
            updatedAt: Date.now(),
        }
        this.#validateTransaction(updatedTransaction)

        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.TRANSACTIONS, 'readwrite')
        const store = tx.objectStore(Stores.TRANSACTIONS)

        try {
            await store.put(updatedTransaction)
            return updatedTransaction
        } catch (error) {
            console.error('Failed to update transaction:', error)
            throw error
        }
    }

    async deleteTransaction(id: string): Promise<void> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.TRANSACTIONS, 'readwrite')
        const store = tx.objectStore(Stores.TRANSACTIONS)

        try {
            await store.delete(id)
        } catch (error) {
            console.error('Failed to delete transaction:', error)
            throw error
        }
    }

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
