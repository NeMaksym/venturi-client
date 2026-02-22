import { currency } from '../../../utils'
import {
    BankSourceData,
    BankTransaction,
    SourceTransaction,
} from '../../../types'
import { encodeKey, LoadExchangeRatesDTO } from './loadExchangeRates'

const REFERENCE_CURRENCY_CODE = currency.usdNumCode

export interface ToSystemTransactionsDTO extends LoadExchangeRatesDTO {
    systemTransactions: Omit<BankTransaction, 'createdAt' | 'updatedAt'>[]
}

type SystemTransaction = ToSystemTransactionsDTO['systemTransactions'][number]

type ToSystemTransactions = (
    input: LoadExchangeRatesDTO
) => ToSystemTransactionsDTO

export const toSystemTransactions: ToSystemTransactions = (input) => {
    const { sourceTransactions, bankId, exchangeRatesMap, addMessage } = input

    addMessage('Adding reference amount to transactions...')

    // Reference amount should be computed based on account amount.
    // "amount" is always >= "operation.amount" because of commission, double exchange, etc.
    const systemTransactions = sourceTransactions.map(
        (transaction): SystemTransaction => {
            const referenceAmount =
                transaction.currencyCode === REFERENCE_CURRENCY_CODE
                    ? Math.abs(transaction.amount)
                    : calculateRefAmount(transaction, exchangeRatesMap)

            const type: BankTransaction['type'] =
                transaction.amount < 0 ? 'expense' : 'income'

            const source: BankSourceData = {
                type: 'bank',
                bankId,
                amount: transaction.amount,
                currencyCode: transaction.currencyCode,
                ...(transaction.account && { account: transaction.account }),
                ...(transaction.card && { card: transaction.card }),
                ...(transaction.operation && {
                    operation: transaction.operation,
                }),
                ...(transaction.originalId && {
                    originalId: transaction.originalId,
                }),
                ...(transaction.commissionRate && {
                    commissionRate: transaction.commissionRate,
                }),
                ...(transaction.mcc && { mcc: transaction.mcc }),
                ...(transaction.hold && { hold: transaction.hold }),
            }

            return {
                id: crypto.randomUUID(),
                type,
                time: transaction.time,
                description: transaction.description,
                referenceAmount,
                referenceCurrencyCode: REFERENCE_CURRENCY_CODE,
                category: '',
                capitalized: false,
                hide: false,
                labels: [],
                comment: transaction.comment || '',
                source: source,
            }
        }
    )

    return {
        ...input,
        systemTransactions,
    }
}

function calculateRefAmount(
    transaction: SourceTransaction,
    exchangeRatesMap: LoadExchangeRatesDTO['exchangeRatesMap']
): number {
    const key = encodeKey(transaction)

    const rate = exchangeRatesMap.get(key)

    if (!rate) {
        throw new Error(`Exchange rate not found for ${key}`)
    }

    return Math.round(Math.abs(transaction.amount) * rate)
}
