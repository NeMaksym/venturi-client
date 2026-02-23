import React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import TableCell, { type TableCellProps } from '@mui/material/TableCell'

import { EmptyBodyRow, SubTransactionBodyRow, TransactionBodyRow } from './Rows'
import {
    TransactionActionHandler,
    TransactionDeleteHandler,
    type TransactionRow,
} from './types'
import { TransactionProvider } from './context'
import { Category } from '../../types'

const TABLE_COLUMNS: { label: string; cellProps?: TableCellProps }[] = [
    { label: 'Date', cellProps: { sx: { width: 120 } } },
    { label: 'Description' },
    { label: 'Amount', cellProps: { align: 'right' } },
    { label: 'Category', cellProps: { sx: { width: 190 } } },
    { label: 'Labels', cellProps: { sx: { width: 190 } } },
    { label: '' },
]

export interface TransactionsTableProps {
    rows: TransactionRow[]
    handlers: {
        onCommentChange: TransactionActionHandler<string>
        onCategoryChange: TransactionActionHandler<string>
        onLabelChange: TransactionActionHandler<string[]>
        onHideChange: TransactionActionHandler<boolean>
        onCapitalizeChange: TransactionActionHandler<boolean>
        onDelete: TransactionDeleteHandler
        onSubTransactionCreate: TransactionActionHandler<number>
    }
    options: {
        categories: Category[]
        labels: string[]
    }
}

// TODO: Adjust design for MobX. Today category cell doesn't react to data change.
export const TransactionsTable: React.FC<TransactionsTableProps> = ({
    rows,
    handlers,
    options,
}) => {
    return (
        <TransactionProvider handlers={handlers} options={options}>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {TABLE_COLUMNS.map((column, index) => (
                                <TableCell key={index} {...column.cellProps}>
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.length === 0 ? (
                            <EmptyBodyRow colSpan={TABLE_COLUMNS.length} />
                        ) : (
                            rows.map((row) =>
                                row.parentId !== null ? (
                                    <SubTransactionBodyRow
                                        key={row.id}
                                        data={row}
                                    />
                                ) : (
                                    <TransactionBodyRow
                                        key={row.id}
                                        data={row}
                                    />
                                )
                            )
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </TransactionProvider>
    )
}
