import React, { useState, useRef } from 'react'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'

interface CommentDialogProps {
    open: boolean
    comment: string
    onSubmit: (comment: string) => void
    onClose: () => void
}

export const CommentDialog: React.FC<CommentDialogProps> = ({
    open,
    comment,
    onSubmit,
    onClose,
}) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const [value, setValue] = useState(comment)

    const handleSubmit = () => {
        onSubmit(value)
        onClose()
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit()
        }
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="comment-dialog-title"
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
            <DialogTitle id="comment-dialog-title">Comment</DialogTitle>
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
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyUp={handleKeyPress}
                        fullWidth
                        placeholder="Add your comment here..."
                        variant="outlined"
                        autoFocus
                    />
                    <Typography variant="caption" color="text.secondary">
                        Tip: Hover over the transaction description to see your
                        comment
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    color="primary"
                    variant="contained"
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    )
}
