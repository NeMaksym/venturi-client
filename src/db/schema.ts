import { DBSchema } from 'idb'

import type { AnyTransaction, Category } from '../types'

export const Stores = {
    TRANSACTIONS: 'transactions',
    EXPENSE_CATEGORIES: 'expense-categories',
} as const

export interface VenturiDB extends DBSchema {
    [Stores.TRANSACTIONS]: {
        key: string
        value: AnyTransaction
        indexes: {
            time: number
            category: string
            parentId: string
        }
    }
    [Stores.EXPENSE_CATEGORIES]: {
        key: string
        value: Category
    }
}
