import { IDBPDatabase } from 'idb'

import { VenturyDB, Stores } from './schema'
import { seedDefaultCategories } from './seeds'

const initializeDB = (db: IDBPDatabase<VenturyDB>) => {
    const expensesStore = db.createObjectStore(Stores.EXPENSES, {
        keyPath: 'id',
    })
    expensesStore.createIndex('time', 'time')
    expensesStore.createIndex('bank', 'bank')
    expensesStore.createIndex('category', 'category')
    expensesStore.createIndex('labels', 'labels', {
        multiEntry: true,
    })

    const subExpensesStore = db.createObjectStore(Stores.SUB_EXPENSES, {
        keyPath: 'id',
    })
    subExpensesStore.createIndex('parentId', 'parentId')
    subExpensesStore.createIndex('time', 'time')
    subExpensesStore.createIndex('bank', 'bank')
    subExpensesStore.createIndex('category', 'category')
    subExpensesStore.createIndex('labels', 'labels', {
        multiEntry: true,
    })

    const expenseCategoriesStore = db.createObjectStore(
        Stores.EXPENSE_CATEGORIES,
        { keyPath: 'id' }
    )
    seedDefaultCategories(expenseCategoriesStore)

    const incomesStore = db.createObjectStore(Stores.INCOMES, {
        keyPath: 'id',
    })
    incomesStore.createIndex('time', 'time')
    incomesStore.createIndex('bank', 'bank')
    incomesStore.createIndex('category', 'category')
    incomesStore.createIndex('labels', 'labels', {
        multiEntry: true,
    })
}

export const migrations = [{ version: 1, upgrade: initializeDB }]
