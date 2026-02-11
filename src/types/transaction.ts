/**
 * Represents a category in the system.
 * @interface Category
 * @property {string} id - Unique identifier for the category
 * @property {string} label - Human-readable name of the category
 */
export type Category = {
    id: string
    label: string
}

/**
 * Represents different types of account identifiers.
 * @property {string} type - type of account value
 * @property {string} value - account identifier
 */
type Account = { type: 'iban'; value: string }

/**
 * Represents different types of card identifiers.
 * @property {string} type - type of card value
 * @property {string} value - card identifier
 */
type Card = { type: 'lastFour'; value: string }

/**
 * Represents the structure for a financial operation.
 * @interface Operation
 * @property {number} amount - Operation amount in the smallest currency unit
 * @property {number} currencyCode - Numerical operation currency code (ISO 4217)
 */
export interface Operation {
    amount: number
    currencyCode: number
}

/**
 * Represents the structure for a financial transaction from external sources.
 * @interface SourceTransaction
 * @property {number} time - Transaction timestamp in Unix milliseconds
 * @property {string} description - Description or details of the transaction
 * @property {number} amount - Transaction amount in the smallest account currency unit (e.g., cents)
 * @property {number} currencyCode - Numerical account currency code (ISO 4217)
 * @property {Account} account - Account identifier
 * @property {Card} card - Card identifier
 * @property {string} [originalId] - Original identifier from the source system (usually transaction id from external source)
 * @property {Operation} [operation] - Operation info
 * @property {string} [comment] - Optional additional comments about the transaction
 * @property {number} [commissionRate] - Optional commission rate for the transaction in the smallest *account* currency unit.
 * @property {number} [mcc] - Optional Merchant Category Code (MCC) for categorizing the transaction
 * @property {boolean} [hold] - Optional flag indicating if the transaction is on hold
 */
export interface SourceTransaction {
    time: number
    description: string
    amount: number
    currencyCode: number
    account?: Account
    card?: Card
    originalId?: string
    operation?: Operation
    comment?: string
    commissionRate?: number
    mcc?: number
    hold?: boolean
}

/**
 * Represents a transaction with additional system-level metadata.
 * @interface SystemTransaction
 * @extends SourceTransaction
 * @property {string} type - Transaction type
 * @property {string} id - Unique identifier for the transaction
 * @property {string} bankId - The bank that originated this transaction
 * @property {number} referenceAmount - Reference amount in the smallest currency unit for comparison
 * @property {number} referenceCurrencyCode - Numerical code representing the reference currency
 * @property {Category['id'] | ''} category - System-assigned category for the transaction, empty string if uncategorized
 * @property {string[]} labels - Array of system-assigned labels or tags
 * @property {boolean} capitalized - Flag indicating if the transaction is capitalized
 * @property {boolean} hide - Flag indicating if the transaction is hidden
 * @property {number} createdAt - Creation timestamp of the transaction in Unix milliseconds
 * @property {number} updatedAt - Timestamp of the transaction last update in Unix milliseconds
 */
export interface SystemTransaction extends Pick<
    SourceTransaction,
    | 'originalId'
    | 'time'
    | 'description'
    | 'amount'
    | 'currencyCode'
    | 'operation'
    | 'account'
    | 'card'
    | 'comment'
    | 'mcc'
    | 'hold'
> {
    type: 'expense' | 'income'
    id: string
    bankId: string
    referenceAmount: number
    referenceCurrencyCode: number
    category: Category['id'] | ''
    capitalized: boolean
    hide: boolean
    labels: string[]
    comment: string
    createdAt: number
    updatedAt: number
}

export type RawSystemTransaction = Omit<
    SystemTransaction,
    'createdAt' | 'updatedAt'
>

/**
 * Represents a sub-transaction of a system transaction.
 * @interface SystemSubTransaction
 * @extends SystemTransaction
 * @property {string} parentId - Unique identifier for the parent transaction
 */
export interface SystemSubTransaction extends Pick<
    SystemTransaction,
    | 'id'
    | 'time'
    | 'description'
    | 'amount'
    | 'currencyCode'
    | 'account'
    | 'card'
    | 'bankId'
    | 'referenceAmount'
    | 'referenceCurrencyCode'
    | 'category'
    | 'capitalized'
    | 'hide'
    | 'labels'
    | 'comment'
    | 'createdAt'
    | 'updatedAt'
> {
    parentId: string
}

export type RawSystemSubTransaction = Omit<
    SystemSubTransaction,
    'createdAt' | 'updatedAt'
>
