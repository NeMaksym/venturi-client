import { DBSchema } from 'idb'

import type {
    SystemTransaction,
    SystemSubTransaction,
    Category,
} from '../types'

export const Stores = {
    TRANSACTIONS: 'transactions',
    SUB_EXPENSES: 'sub-expenses',
    EXPENSE_CATEGORIES: 'expense-categories',
} as const

export interface VenturiDB extends DBSchema {
    [Stores.TRANSACTIONS]: {
        key: string
        value: SystemTransaction
        indexes: {
            time: number
            category: string
        }
    }
    [Stores.SUB_EXPENSES]: {
        key: string
        value: SystemSubTransaction
        indexes: {
            parentId: string
            time: number
            bankId: string
            category: string
            labels: string
        }
    }
    [Stores.EXPENSE_CATEGORIES]: {
        key: string
        value: Category
    }
}
