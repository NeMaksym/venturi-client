import readXlsxFile, { Row } from 'read-excel-file'
import cc from 'currency-codes'

import type { SourceTransaction } from '../../../types'

const HEADER_ROWS_COUNT = 2
const REQUIRED_COLUMNS_COUNT = 10

class PrivateBankStatementRow {
    private row: Row
    private rowIndex: number

    constructor(row: Row, rowIndex: number) {
        if (row.length < REQUIRED_COLUMNS_COUNT) {
            throw new Error(
                `Row ${rowIndex}: Expected ${REQUIRED_COLUMNS_COUNT} columns, got ${row.length}`
            )
        }

        this.rowIndex = rowIndex
        this.row = row
    }

    private get dateTime(): string {
        const dateTime = this.row[0]

        if (typeof dateTime !== 'string' || !dateTime.length) {
            throw new Error(`Row ${this.rowIndex} has invalid date value`)
        }

        return dateTime
    }

    private get category(): string {
        const category = this.row[1]

        if (typeof category !== 'string' || !category.length) {
            throw new Error(`Row ${this.rowIndex} has invalid category value`)
        }

        return category
    }

    private get maskedPan(): string {
        let maskedPan = this.row[2]

        if (typeof maskedPan !== 'string') {
            throw new Error(`Row ${this.rowIndex} has invalid card value`)
        }

        maskedPan = maskedPan.replace(/\s+/g, '')

        if (maskedPan.length < 16) {
            throw new Error(`Row ${this.rowIndex} has invalid card value`)
        }

        return maskedPan
    }

    private get description(): string {
        const description = this.row[3]

        if (typeof description !== 'string' || !description.length) {
            throw new Error(
                `Row ${this.rowIndex} has invalid description value`
            )
        }

        return description
    }

    private get amount(): number {
        const amount = this.row[4]

        if (typeof amount !== 'number') {
            throw new Error(`Row ${this.rowIndex} has invalid amount value`)
        }

        return amount
    }

    private get currency(): string {
        const currency = this.row[5]

        if (typeof currency !== 'string' || !currency.length) {
            throw new Error(`Row ${this.rowIndex} has invalid currency value`)
        }

        return currency
    }

    private get operationAmount(): number {
        const operationAmount = this.row[6]

        if (typeof operationAmount !== 'number') {
            throw new Error(
                `Row ${this.rowIndex} has invalid operation amount value`
            )
        }

        return operationAmount
    }

    private get operationCurrency(): string {
        const operationCurrency = this.row[7]

        if (
            typeof operationCurrency !== 'string' ||
            !operationCurrency.length
        ) {
            throw new Error(
                `Row ${this.rowIndex} has invalid operation currency value`
            )
        }

        return operationCurrency
    }

    // Data-time isn't in UTC. Likely it's in local time. May affect the duplicate find logic (because it uses time as one of parameters)
    // TODO: Think how to address via UX
    private getTimestamp(): number {
        const [datePart, timePart] = this.dateTime.split(' ')

        if (!datePart || !timePart) {
            throw new Error(`Row ${this.rowIndex} has invalid date value`)
        }

        const [day, month, year] = datePart.split('.')
        const [hours, minutes, seconds] = timePart.split(':')

        if (!day || !month || !year || !hours || !minutes || !seconds) {
            throw new Error(`Row ${this.rowIndex} has invalid date value`)
        }

        return new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hours),
            parseInt(minutes),
            parseInt(seconds)
        ).getTime()
    }

    private toSmallestUnit(val: number): number {
        return Math.round(val * 100)
    }

    private toCurrencyCodeNumber(currency: string): number {
        const code = cc.code(currency.toUpperCase())

        if (!code) {
            throw new Error(
                `Row ${this.rowIndex} has invalid currency value (must be ISO 4217 code)`
            )
        }

        return Number(code.number)
    }

    public get transaction(): SourceTransaction {
        return {
            time: this.getTimestamp(),
            description: this.description.trim(),
            amount: this.toSmallestUnit(this.amount),
            currencyCode: this.toCurrencyCodeNumber(this.currency),
            operation: {
                amount: this.toSmallestUnit(this.operationAmount),
                currencyCode: this.toCurrencyCodeNumber(this.operationCurrency),
            },
            card: {
                type: 'lastFour',
                value: this.maskedPan.slice(-4),
            },
        }
    }
}

export const parsePrivateBankRegularStatement = async (
    file: File
): Promise<SourceTransaction[]> => {
    try {
        const rows = await readXlsxFile(file)

        if (rows.length < HEADER_ROWS_COUNT + 1) {
            throw new Error(
                `File does not contain enough rows. Expected at least ${
                    HEADER_ROWS_COUNT + 1
                } rows (header rows + data).`
            )
        }

        const dataRows = rows.slice(HEADER_ROWS_COUNT)

        return dataRows.map((row, index) => {
            const rowIndex = index + HEADER_ROWS_COUNT + 1
            const statementRow = new PrivateBankStatementRow(row, rowIndex)
            return statementRow.transaction
        })
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to parse statement: ${error.message}`)
        }
        throw new Error('Failed to parse statement: Unknown error')
    }
}
