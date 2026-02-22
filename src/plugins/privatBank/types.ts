import type { SourceTransaction } from '../../types'

/**
 * Represents a financial transaction in the private API.
 * @typedef {Array} PrivateTransaction
 * @property {string} 0 - Timestamp of the transaction (e.g. "14.05.2025 20:23:59")
 * @property {string} 1 - Transaction category (e.g. "Кіно")
 * @property {string} 2 - Card number used in transaction (e.g. "4627 **** **** 6191")
 * @property {string} 3 - Transaction description/details (e.g. "Megogo")
 * @property {number} 4 - Transaction amount in account currency (positive for income, negative for expense) (e.g. -4014.64)
 * @property {string} 5 - Account currency code (e.g. "UAH")
 * @property {number} 6 - Original transaction amount (e.g. 95.95)
 * @property {string} 7 - Original transaction currency code (e.g. "USD")
 * @property {number} 8 - Account balance after transaction (e.g. -90785.13)
 * @property {string} 9 - Account balance currency code (e.g. "UAH")
 */
export type StatementRow = [
    string, // time
    string, // category
    string, // cardNumber
    string, // description
    number, // amount
    string, // currency
    number, // operationAmount
    string, // operationCurrency
    number, // balance
    string, // balanceCurrency
]
