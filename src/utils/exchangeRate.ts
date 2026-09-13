// Free Currency Exchange Rates API
// https://github.com/fawazahmed0/exchange-api?tab=readme-ov-file
class ExchangeRate {
    private BASE_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@'
    private FALLBACK_BASE_URL = 'https://currency-api.pages.dev'

    private validateDate(date: string): void {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/ // YYYY-MM-DD (2024-03-06)

        if (!dateRegex.test(date)) {
            throw new Error('Invalid date format')
        }
    }

    private buildUrls(date: string, baseCurrency: string): string[] {
        const path = `/v1/currencies/${baseCurrency}.json`
        const fallbackHost = this.FALLBACK_BASE_URL.replace(
            '://',
            `://${date}.`
        )

        return [`${this.BASE_URL}${date}${path}`, `${fallbackHost}${path}`]
    }

    private async fetchRates(
        date: string,
        baseCurrency: string
    ): Promise<Record<string, number>> {
        const urls = this.buildUrls(date, baseCurrency)
        let lastError: unknown

        for (const url of urls) {
            try {
                const res = await fetch(url)

                if (!res.ok) {
                    throw new Error(`${res.status} ${res.statusText}`)
                }

                const data = await res.json()
                const rates = data?.[baseCurrency]

                if (!rates) {
                    throw new Error(`No rates for ${baseCurrency}`)
                }

                return rates
            } catch (err) {
                lastError = err
            }
        }

        throw lastError instanceof Error
            ? lastError
            : new Error('Request failed')
    }

    async onDate(
        date: string,
        baseCurrency: string,
        targetCurrency: string
    ): Promise<number> {
        baseCurrency = baseCurrency.toLowerCase()
        targetCurrency = targetCurrency.toLowerCase()

        try {
            this.validateDate(date)

            const rates = await this.fetchRates(date, baseCurrency)
            const rate = rates[targetCurrency]

            if (rate === undefined) {
                throw new Error(`No rate for ${targetCurrency}`)
            }

            return rate
        } catch (err) {
            if (err instanceof Error) {
                throw new Error(`Failed to fetch exchange rate: ${err.message}`)
            }

            throw new Error('Failed to fetch exchange rate')
        }
    }
}

export const exchangeRate = new ExchangeRate()
