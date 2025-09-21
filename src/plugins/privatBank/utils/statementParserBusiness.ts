import readXlsxFile, { Row } from 'read-excel-file'
import cc from 'currency-codes'

import type { SourceTransaction } from '../../../types'

const HEADER_ROWS_COUNT = 5
const REQUIRED_COLUMNS_COUNT = 11

class PrivatBankStatementHeader {
    private headerRow: Row

    constructor(headerRow: Row | undefined) {
        if (!headerRow || !headerRow[0]) {
            throw new Error('Header row is missing or empty')
        }

        this.headerRow = headerRow
    }

    private get headerText(): string {
        const headerText = this.headerRow[0]

        if (typeof headerText !== 'string' || !headerText.length) {
            throw new Error('Header row does not contain valid header text')
        }

        return headerText
    }

    public extractIban(): string {
        const ibanRegex = /[A-Z]{2}\d{2}[A-Z0-9]+/
        const match = this.headerText.match(ibanRegex)

        if (!match) {
            throw new Error('IBAN not found in header')
        }

        return match[0]
    }
}

class PrivateBankStatementRow {
    private row: Row
    private rowIndex: number
    private iban: string

    constructor(row: Row, rowIndex: number, iban: string) {
        if (row.length < REQUIRED_COLUMNS_COUNT) {
            throw new Error(
                `Row ${rowIndex}: Expected ${REQUIRED_COLUMNS_COUNT} columns, got ${row.length}`
            )
        }

        this.rowIndex = rowIndex
        this.row = row
        this.iban = iban
    }

    private get date(): string {
        const date = this.row[1]

        if (typeof date !== 'string' || !date.length) {
            throw new Error(`Row ${this.rowIndex} has invalid date value`)
        }

        return date
    }

    private get time(): string {
        const time = this.row[2]

        if (typeof time !== 'string' || !time.length) {
            throw new Error(`Row ${this.rowIndex} has invalid time value`)
        }

        return time
    }

    private get description(): string {
        const description = this.row[5]

        if (typeof description !== 'string' || !description.length) {
            throw new Error(
                `Row ${this.rowIndex} has invalid description value`
            )
        }

        return description
    }

    private get amount(): number {
        const amount = this.row[3]

        if (typeof amount !== 'number') {
            throw new Error(`Row ${this.rowIndex} has invalid amount value`)
        }

        return amount
    }

    private get currency(): string {
        const currency = this.row[4]

        if (typeof currency !== 'string' || !currency.length) {
            throw new Error(`Row ${this.rowIndex} has invalid currency value`)
        }

        return currency
    }

    private getTimestamp(): number {
        const datePart = this.date
        const timePart = this.time

        const [day, month, year] = datePart.split('.')
        const [hours, minutes, seconds] = timePart.split(':')

        if (!day || !month || !year || !hours || !minutes || !seconds) {
            throw new Error(
                `Row ${this.rowIndex} has invalid date or time format`
            )
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
            account: {
                type: 'iban',
                value: this.iban,
            },
        }
    }
}

export const parsePrivateBankBusinessStatement = async (
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

        const headerRow = rows[1]
        const header = new PrivatBankStatementHeader(headerRow)
        const iban = header.extractIban()

        const dataRows = rows.slice(HEADER_ROWS_COUNT)

        return dataRows.map((row, index) => {
            const rowIndex = index + HEADER_ROWS_COUNT + 1
            const statementRow = new PrivateBankStatementRow(
                row,
                rowIndex,
                iban
            )
            return statementRow.transaction
        })
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to parse statement: ${error.message}`)
        }
        throw new Error('Failed to parse statement: Unknown error')
    }
}
