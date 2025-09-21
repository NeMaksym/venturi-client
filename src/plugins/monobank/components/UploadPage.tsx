import React, { useCallback } from 'react'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'

import { useTokenInput } from '../hooks/useTokenInput'
import { useTransactions } from '../hooks/useTransactions'
import { useClientInfo } from '../hooks/useClientInfo'
import { TokenInput } from './TokenInput'
import { AccountSelector } from './AccountSelector'
import { useAccountSelector } from '../hooks/useAccountSelector'
import { DateRangePicker } from './DateRangePicker'
import { TransactionsList } from './TransactionsList'
import { useDateRange } from '../hooks/useDateRange'
import { UploadPageProps } from '../../../types'
import { MonoAPIClientInfo, MonoAPITransaction } from '../types'
import { toSourceTransactions } from '../helpers/toSourceTransactions'

// TODO: Let user fetch more than 30 days of transactions at once
export const UploadPage: React.FC<UploadPageProps> = ({ uploadData }) => {
    const [apiToken, setApiToken] = useTokenInput()
    const {
        data: clientInfo,
        isLoading: isClientInfoLoading,
        error: clientInfoError,
        fetch: clientInfoFetch,
    } = useClientInfo()

    const [accountId, setAccountId] = useAccountSelector(clientInfo?.accounts)
    const { startDate, endDate, setStartDate, setEndDate } = useDateRange()

    const {
        data: transactions,
        isLoading: isTransactionsLoading,
        fetch: transactionsFetch,
        error: transactionsError,
    } = useTransactions()

    const onFetchTransactions = useCallback(() => {
        function onSuccess(
            data: MonoAPITransaction[],
            account: MonoAPIClientInfo['accounts'][number]
        ) {
            const sourceTransactions = toSourceTransactions(data, account)
            if (sourceTransactions.length > 0) {
                uploadData(sourceTransactions)
            }
        }

        const account = clientInfo?.accounts?.find(({ id }) => id === accountId)
        if (!account) throw new Error('Unexpected error: account not found')

        transactionsFetch(
            {
                apiToken,
                account,
                startDate,
                endDate,
            },
            onSuccess
        )
    }, [apiToken, accountId, startDate, endDate, transactionsFetch, uploadData])

    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={2}>
                    <Typography variant="h4" component="h2" gutterBottom>
                        Monobank
                    </Typography>

                    <TokenInput value={apiToken} onChange={setApiToken} />

                    <Button
                        variant="contained"
                        onClick={() => clientInfoFetch(apiToken)}
                        disabled={!apiToken || isClientInfoLoading}
                        startIcon={
                            isClientInfoLoading ? (
                                <CircularProgress size={20} color="inherit" />
                            ) : undefined
                        }
                        children={'Fetch Client Info'}
                    />

                    {clientInfoError && (
                        <Typography variant="body2" color="error">
                            {clientInfoError}
                        </Typography>
                    )}

                    <AccountSelector
                        accounts={clientInfo?.accounts ?? []}
                        value={accountId}
                        onChange={setAccountId}
                        disabled={!clientInfo}
                    />

                    <DateRangePicker
                        disabled={!clientInfo}
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                    />

                    <Button
                        variant="contained"
                        onClick={onFetchTransactions}
                        disabled={
                            !apiToken || isTransactionsLoading || !accountId
                        }
                        startIcon={
                            isTransactionsLoading ? (
                                <CircularProgress size={20} color="inherit" />
                            ) : undefined
                        }
                        children={'Fetch Transactions'}
                    />

                    {transactionsError && (
                        <Typography variant="body2" color="error">
                            {transactionsError}
                        </Typography>
                    )}

                    {transactions && (
                        <TransactionsList transactions={transactions} />
                    )}
                </Stack>
            </Grid>
        </Grid>
    )
}
