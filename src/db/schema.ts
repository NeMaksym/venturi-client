import { DBSchema } from 'idb'

import type { Transaction, SubTransaction, Category } from '../types'

export const Stores = {
    TRANSACTIONS: 'transactions',
    SUB_TRANSACTIONS: 'sub-transactions',
    EXPENSE_CATEGORIES: 'expense-categories',
} as const

export interface VenturiDB extends DBSchema {
    [Stores.TRANSACTIONS]: {
        key: string
        value: Transaction
        indexes: {
            time: number
            category: string
        }
    }
    [Stores.SUB_TRANSACTIONS]: {
        key: string
        value: SubTransaction
        indexes: {
            parentId: string
            time: number
            category: string
        }
    }
    [Stores.EXPENSE_CATEGORIES]: {
        key: string
        value: Category
    }
}
