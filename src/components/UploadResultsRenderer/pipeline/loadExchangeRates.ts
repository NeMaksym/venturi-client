import { exchangeRate } from '../../../utils/exchangeRate'
import { SourceTransaction } from '../../../types'
import { currency } from '../../../utils/currency'
import { type PipelineInput } from './validate'

type ExchangeRateMap = Map<string, number>

export interface LoadExchangeRatesDTO extends PipelineInput {
    exchangeRatesMap: ExchangeRateMap
}

type LoadExchangeRates = (input: PipelineInput) => Promise<LoadExchangeRatesDTO>

export const loadExchangeRates: LoadExchangeRates = async (input) => {
    const { sourceTransactions, addMessage } = input

    addMessage('Fetching exchange rates...')

    const keySet = new Set(
        sourceTransactions
            .filter(
                (transaction) =>
                    transaction.currencyCode !== currency.usdNumCode
            )
            .map(encodeKey)
    )

    const promises = [...keySet].map(async (key): Promise<[string, number]> => {
        const { date, alphaCode } = decodeKey(key)

        const rate = await exchangeRate.onDate(
            date,
            alphaCode,
            currency.usd.code
        )

        return [key, rate]
    })

    const exchangeRatesMap = new Map<string, number>(
        await Promise.all(promises)
    )

    return {
        ...input,
        exchangeRatesMap,
    }
}

const DELIMITER = '__'

export function encodeKey(transaction: SourceTransaction): string {
    const date = new Date(transaction.time).toISOString().split('T')[0]
    const alphaCode = currency.numToAlpha(transaction.currencyCode)

    return `${date}${DELIMITER}${alphaCode}`
}

function decodeKey(key: string): { date: string; alphaCode: string } {
    const [date, alphaCode] = key.split(DELIMITER)

    if (!date || !alphaCode) {
        throw new Error(`Invalid key: ${key}`)
    }

    return { date, alphaCode }
}
