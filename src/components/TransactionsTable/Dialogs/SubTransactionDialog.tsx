import React, { useRef, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'

import { fromSmallestUnit, toSmallestUnit } from '../../../utils'

interface SubTransactionDialogProps {
    open: boolean
    maxAmount: number
    onSubmit: (amount: number) => void
    onCancel: () => void
}

export const SubTransactionDialog: React.FC<SubTransactionDialogProps> = ({
    open,
    maxAmount,
    onSubmit,
    onCancel,
}) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const [amount, setAmount] = useState<string>('')
    const [touched, setTouched] = useState(false)

    const handleFormChange = (field: string, value: string) => setAmount(value)

    const parsedAmount = parseFloat(amount)
    const isFormValid =
        amount !== '' &&
        !isNaN(parsedAmount) &&
        parsedAmount > 0 &&
        toSmallestUnit(parsedAmount) <= maxAmount

    const handleSubmit = () => {
        onSubmit(parsedAmount)
        handleCancel()
    }

    const handleCancel = () => {
        setAmount('')
        setTouched(false)
        onCancel()
    }

    return (
        <Dialog
            open={open}
            onClose={handleCancel}
            aria-labelledby="sub-transaction-dialog-title"
            maxWidth="sm"
            fullWidth
            slotProps={{
                transition: {
                    onEnter: () => {
                        inputRef.current?.focus()
                    },
                },
            }}
        >
            <DialogTitle id="sub-transaction-dialog-title">
                Create Sub-transaction
            </DialogTitle>
            <DialogContent>
                <Box
                    sx={{
                        pt: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    <TextField
                        inputRef={inputRef}
                        label="Amount"
                        type="number"
                        value={amount}
                        onChange={(e) => {
                            setTouched(true)
                            handleFormChange('amount', e.target.value)
                        }}
                        helperText={`Maximum: ${fromSmallestUnit(maxAmount)}`}
                        error={touched && !isFormValid}
                        fullWidth
                        required
                        autoFocus
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel} color="primary">
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    color="primary"
                    variant="contained"
                    disabled={!isFormValid}
                >
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    )
}
