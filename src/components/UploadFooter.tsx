import React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

interface UploadFooterProps {
    onBack: () => void
    isBackDisabled: boolean
    onNext: () => void
    isNextDisabled: boolean
}

export const UploadFooter: React.FC<UploadFooterProps> = ({
    onBack,
    isBackDisabled,
    onNext,
    isNextDisabled,
}) => {
    const sx = {
        display: 'flex',
        justifyContent: 'space-between',
        mt: 4,
        px: 2,
    }

    return (
        <Box sx={sx}>
            <Button
                variant="outlined"
                onClick={onBack}
                disabled={isBackDisabled}
            >
                Back
            </Button>
            <Button
                variant="contained"
                onClick={onNext}
                disabled={isNextDisabled}
            >
                Next
            </Button>
        </Box>
    )
}
