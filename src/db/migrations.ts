import { IDBPDatabase } from 'idb'

import { VenturiDB, Stores } from './schema'
import { seedDefaultCategories } from './seeds'

const initializeDB = (db: IDBPDatabase<VenturiDB>) => {
    const transactionsStore = db.createObjectStore(Stores.TRANSACTIONS, {
        keyPath: 'id',
    })
    transactionsStore.createIndex('time', 'time')
    transactionsStore.createIndex('category', 'category')
    transactionsStore.createIndex('parentId', 'parentId')

    const expenseCategoriesStore = db.createObjectStore(
        Stores.EXPENSE_CATEGORIES,
        { keyPath: 'id' }
    )
    seedDefaultCategories(expenseCategoriesStore)
}

export const migrations = [{ version: 1, upgrade: initializeDB }]
