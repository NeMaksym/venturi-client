import { Stores } from '../schema'
import { DBProvider } from '../provider'
import { AnyTransaction, BankSourceData, CashSourceData } from '../../types'
import {
    currency,
    isFourDigitString,
    isIBAN,
    isValidUnixMillis,
} from '../../utils'

export class TransactionService {
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
            if (!isIBAN(source.account.value)) {
                throw new Error('Invalid IBAN')
            }
        }
        if (source.card) {
            if (!isFourDigitString(source.card.value)) {
                throw new Error('Invalid last four digits')
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

    #validateTransaction(transaction: AnyTransaction): void {
        this.#validateType(transaction)

        if (!isValidUnixMillis(transaction.time)) {
            throw new Error('Time should be number in unix milliseconds')
        }

        if (transaction.referenceAmount <= 0) {
            throw new Error('Transaction referenceAmount must be positive')
        }

        switch (transaction.source.type) {
            case 'bank':
                this.#validateBankSource(transaction.source)
                break
            case 'cash':
                this.#validateCashSource(transaction.source)
                break
        }
    }

    // TODO: Improve
    async transactionExists(
        transaction:
            | AnyTransaction
            | Omit<AnyTransaction, 'createdAt' | 'updatedAt'>
    ): Promise<boolean> {
        if (transaction.source.type === 'cash') return false

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
                    dbTransaction.source.type === 'bank' &&
                    transaction.source.type === 'bank' &&
                    dbTransaction.source.bankId === transaction.source.bankId &&
                    dbTransaction.source.amount === transaction.source.amount
            )
        } catch (error) {
            console.error('Failed to check if transaction exists:', error)
            throw error
        }
    }

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

    async addTransaction(
        transaction: Omit<AnyTransaction, 'createdAt' | 'updatedAt'>
    ): Promise<AnyTransaction> {
        const transactionWithTimestamps: AnyTransaction = {
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

    async updateTransaction(
        transaction: AnyTransaction
    ): Promise<AnyTransaction> {
        const updatedTransaction: AnyTransaction = {
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
