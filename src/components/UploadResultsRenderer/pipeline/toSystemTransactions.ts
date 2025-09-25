import { currency } from '../../../utils'
import { RawSystemTransaction, SourceTransaction } from '../../../types'
import { encodeKey, LoadExchangeRatesDTO } from './loadExchangeRates'

const REFERENCE_CURRENCY_CODE = currency.usdNumCode

export interface ToSystemTransactionsDTO extends LoadExchangeRatesDTO {
    systemTransactions: RawSystemTransaction[]
}

type ToSystemTransactions = (
    input: LoadExchangeRatesDTO
) => ToSystemTransactionsDTO

export const toSystemTransactions: ToSystemTransactions = (input) => {
    const { sourceTransactions, bankId, exchangeRatesMap, addMessage } = input

    addMessage('Adding reference amount to transactions...')

    // Reference amount should be computed based on account amount.
    // "amount" is always >= "operation.amount" because of commission, double exchange, etc.
    const systemTransactions = sourceTransactions.map((transaction) => {
        const referenceAmount =
            transaction.currencyCode === REFERENCE_CURRENCY_CODE
                ? Math.abs(transaction.amount)
                : calculateRefAmount(transaction, exchangeRatesMap)

        return {
            ...transaction,
            id: crypto.randomUUID(),
            bankId,
            referenceAmount,
            referenceCurrencyCode: REFERENCE_CURRENCY_CODE,
            category: '',
            capitalized: false,
            hide: false,
            labels: [],
            comment: transaction.comment || '',
        }
    })

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
