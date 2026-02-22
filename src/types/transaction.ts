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
interface Operation {
    amount: number
    currencyCode: number
}

/**
 * Represents the structure for a financial transaction from a bank source. Is not stored directly.
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
 * Source data for a bank-originated transaction.
 * @property {string} bankId - The bank plugin that originated this transaction
 * @property {number} amount - Transaction amount in the smallest account currency unit (e.g., cents)
 * @property {number} currencyCode - Numerical account currency code (ISO 4217)
 * @property {Account} [account] - Account identifier (at least one of account/card required)
 * @property {Card} [card] - Card identifier (at least one of account/card required)
 * @property {Operation} [operation] - Operation info
 * @property {string} [originalId] - Original transaction identifier from the source system
 * @property {number} [commissionRate] - Commission rate in the smallest account currency unit
 * @property {number} [mcc] - Merchant Category Code
 * @property {boolean} [hold] - Whether the transaction is on hold
 */
export interface BankSourceData {
    type: 'bank'
    bankId: string
    amount: number
    currencyCode: number
    account?: Account
    card?: Card
    operation?: Operation
    originalId?: string
    commissionRate?: number
    mcc?: number
    hold?: boolean
}

/**
 * Source data for a cash transaction.
 * @property {number} amount - Transaction amount in the smallest currency unit
 * @property {number} currencyCode - Numerical currency code (ISO 4217)
 */
export interface CashSourceData {
    type: 'cash'
    amount: number
    currencyCode: number
}

type SourceData = BankSourceData | CashSourceData

/**
 * Represents a system-level transaction.
 * @property {string} id - Unique identifier
 * @property {'expense' | 'income'} type - Flow direction
 * @property {number} time - Transaction timestamp in Unix milliseconds
 * @property {string} description - Description of the transaction
 * @property {number} referenceAmount - Normalized amount in reference currency (positive)
 * @property {number} referenceCurrencyCode - Reference currency code (ISO 4217)
 * @property {Category['id'] | ''} category - Assigned category, empty if uncategorized
 * @property {string[]} labels - Assigned labels or tags
 * @property {boolean} capitalized - Whether the transaction is capitalized
 * @property {boolean} hide - Whether the transaction is hidden
 * @property {string} comment - User comment
 * @property {TransactionSource} sourceMetadata - Source-specific data (bank, cash, etc.)
 * @property {number} createdAt - Creation timestamp in Unix milliseconds
 * @property {number} updatedAt - Last update timestamp in Unix milliseconds
 */
interface Transaction<S> {
    type: 'expense' | 'income'
    id: string
    time: number
    description: string
    referenceAmount: number
    referenceCurrencyCode: number
    category: Category['id'] | ''
    capitalized: boolean
    hide: boolean
    labels: string[]
    comment: string
    source: S
    createdAt: number
    updatedAt: number
}

export type AnyTransaction = Transaction<SourceData>
export type BankTransaction = Transaction<BankSourceData>
export type CashTransaction = Transaction<CashSourceData>

/**
 * Represents a sub-transaction of a transaction.
 * @interface SubTransaction
 * @extends AnyTransaction
 * @property {'sub-expense' | 'sub-income'} type - Sub-transaction type
 * @property {string} parentId - Unique identifier for the parent transaction
 */
export interface SubTransaction extends Pick<
    AnyTransaction,
    | 'id'
    | 'time'
    | 'description'
    | 'referenceAmount'
    | 'referenceCurrencyCode'
    | 'category'
    | 'capitalized'
    | 'hide'
    | 'labels'
    | 'comment'
    | 'source'
    | 'createdAt'
    | 'updatedAt'
> {
    type: 'sub-expense' | 'sub-income'
    parentId: string
}
