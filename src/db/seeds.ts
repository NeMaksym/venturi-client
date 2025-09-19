import type { IDBPObjectStore, StoreNames } from 'idb'

import { Stores, VenturiDB } from './schema'

const DEFAULT_CATEGORIES: string[] = [
    '🎓 Education',
    '👥 Family & Friends',
    '🍽️ Food & Dining',
    '🏥 Health',
    '🍿 Leisure',
    '🏠 Living Place',
    '⚖️ Obligations',
    '📦 Other',
    '👤 Personal & Self-Care',
    '⚙️ Personal Efficiency',
    '🏆 Sports',
    '🚗 Transportation',
]

type ExpenseCategoryStore = IDBPObjectStore<
    VenturiDB,
    ArrayLike<StoreNames<VenturiDB>>,
    typeof Stores.EXPENSE_CATEGORIES,
    'versionchange'
>

export const seedDefaultCategories = (store: ExpenseCategoryStore): void => {
    DEFAULT_CATEGORIES.forEach((label) => {
        store.add({
            id: crypto.randomUUID(),
            label,
        })
    })
}
