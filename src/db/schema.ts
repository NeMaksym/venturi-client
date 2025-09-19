import { DBSchema } from 'idb'

import { SystemTransaction, SystemSubTransaction, Category } from '../types'

export const Stores = {
    EXPENSES: 'expenses',
    SUB_EXPENSES: 'sub-expenses',
    EXPENSE_CATEGORIES: 'expense-categories',
    INCOMES: 'incomes',
} as const

export interface VenturiDB extends DBSchema {
    [Stores.EXPENSES]: {
        key: string
        value: SystemTransaction
        indexes: {
            time: number
            bank: string
            category: string
            labels: string
        }
    }
    [Stores.SUB_EXPENSES]: {
        key: string
        value: SystemSubTransaction
        indexes: {
            parentId: string
            time: number
            bank: string
            category: string
            labels: string
        }
    }
    [Stores.EXPENSE_CATEGORIES]: {
        key: string
        value: Category
    }
    [Stores.INCOMES]: {
        key: string
        value: SystemTransaction
        indexes: {
            time: number
            bank: string
            category: string
            labels: string
        }
    }
}
