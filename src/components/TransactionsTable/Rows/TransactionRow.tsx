import React from 'react'
import TableRow from '@mui/material/TableRow'

import {
    DateCell,
    DescriptionCell,
    CategoryCell,
    AmountCell,
    LabelCell,
    ContextMenuCell,
} from '../Cells'
import { Transaction } from '../../../types'

interface TransactionRowProps {
    data: Transaction
}

export const TransactionBodyRow: React.FC<TransactionRowProps> = ({ data }) => (
    <TableRow sx={{ opacity: data.hide ? 0.5 : 1 }}>
        <DateCell time={data.time} />
        <DescriptionCell
            description={data.description}
            comment={data.comment}
        />
        <AmountCell
            amount={data.amount}
            currencyCode={data.currencyCode}
            referenceAmount={data.referenceAmount}
            referenceCurrencyCode={data.referenceCurrencyCode}
        />
        <CategoryCell transactionId={data.id} category={data.category} />
        <LabelCell transactionId={data.id} labels={data.labels} />
        <ContextMenuCell
            transactionId={data.id}
            comment={data.comment}
            isHidden={data.hide}
            isCapitalized={data.capitalized}
            maxSubTransactionAmount={data.amount}
        />
    </TableRow>
)
