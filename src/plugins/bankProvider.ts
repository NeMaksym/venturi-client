import { BankManifest } from '../types'

class BankProvider {
    static #key = {}
    static instance: BankProvider = new BankProvider(BankProvider.#key)

    constructor(key: {}) {
        if (key !== BankProvider.#key) {
            throw new Error('Bank provider is not constructable directly.')
        }
    }

    #manifestsMap: Record<string, BankManifest> = {}

    add(id: string, manifest: BankManifest): BankProvider {
        if (this.#manifestsMap[id]) {
            throw new Error(`Bank ${id} already exists.`)
        }

        this.#manifestsMap[id] = manifest

        return this
    }

    get labelOptions(): { value: string; label: string }[] {
        return Object.entries(this.#manifestsMap).map(([id, manifest]) => ({
            value: id,
            label: manifest.label,
        }))
    }

    getUploadPageById(id: string): BankManifest['UploadPage'] | null {
        return this.#manifestsMap[id]?.UploadPage ?? null
    }
}

export const bankProvider = BankProvider.instance
