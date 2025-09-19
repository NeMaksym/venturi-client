import { openDB, IDBPDatabase } from 'idb'

import { VenturyDB } from './schema'
import { migrations } from './migrations'

export const DB_CONFIG = {
    name: 'ventury-db',
    version: 1,
} as const

export class DBProvider {
    static #key = {}
    static instance: DBProvider = new DBProvider(DBProvider.#key)

    constructor(key: {}) {
        if (key !== DBProvider.#key) {
            throw new Error('Database is not constructable directly.')
        }
    }

    #db: IDBPDatabase<VenturyDB> | null = null
    #dbPromise: Promise<IDBPDatabase<VenturyDB>> | null = null

    get db(): IDBPDatabase<VenturyDB> | Promise<IDBPDatabase<VenturyDB>> {
        if (this.#db) return this.#db
        if (this.#dbPromise) return this.#dbPromise

        return this.#open()
    }

    async #open(): Promise<IDBPDatabase<VenturyDB>> {
        this.#dbPromise = this.#openImplementation()
            .then((db) => {
                this.#db = db
                return db
            })
            .finally(() => {
                this.#dbPromise = null
            })

        return await this.#dbPromise
    }

    async #openImplementation(): Promise<IDBPDatabase<VenturyDB>> {
        return openDB<VenturyDB>(DB_CONFIG.name, DB_CONFIG.version, {
            blocked: () =>
                console.warn('Database upgrade blocked by another connection'),
            blocking: () =>
                console.warn('Database upgrade is blocking another connection'),
            upgrade: (db, oldVersion) => {
                migrations.forEach((migration) => {
                    if (oldVersion < migration.version) {
                        migration.upgrade(db)
                    }
                })
            },
        })
    }

    close(): void {
        if (this.#db) {
            this.#db.close()
        }
        this.#db = null
        this.#dbPromise = null
    }
}
