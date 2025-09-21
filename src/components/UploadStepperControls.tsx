import React from 'react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

interface UploadFooterProps {
    onBack: () => void
    isBackDisabled: boolean
    onNext: () => void
    isNextDisabled: boolean
}

export const UploadStepperControls: React.FC<UploadFooterProps> = ({
    onBack,
    isBackDisabled,
    onNext,
    isNextDisabled,
}) => {
    return (
        <Stack direction="row" spacing={2}>
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
        </Stack>
    )
}
