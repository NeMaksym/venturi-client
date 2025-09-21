import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CloudUpload from '@mui/icons-material/CloudUpload'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { styled } from '@mui/system'
import { Stack } from '@mui/material'

import { UploadPageProps } from '../../../types'
import { parsePrivateBankRegularStatement } from '../utils/statementParserRegular'
import { parsePrivateBankBusinessStatement } from '../utils/statementParserBusiness'

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
})

const getSelectedFile = (event: React.ChangeEvent<HTMLInputElement>): File => {
    const selectedFile = event.target.files ? event.target.files[0] : null

    if (!selectedFile) {
        throw new Error('No file selected')
    }

    return selectedFile
}

export const UploadPage: React.FC<UploadPageProps> = ({ uploadData }) => {
    const [file, setFile] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [profile, setProfile] = useState<'regular' | 'business'>('regular')

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setError(null)

        try {
            const selectedFile = getSelectedFile(event)

            setFile(selectedFile)

            setIsLoading(true)

            const transactions =
                profile === 'business'
                    ? await parsePrivateBankBusinessStatement(selectedFile)
                    : await parsePrivateBankRegularStatement(selectedFile)

            uploadData(transactions)
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'An error occurred while processing the file'
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Stack spacing={2} maxWidth={600}>
            <ToggleButtonGroup
                exclusive
                size="small"
                value={profile}
                onChange={(event, next) => {
                    if (next) setProfile(next)
                }}
                sx={{ mb: 2 }}
            >
                <ToggleButton value="regular">Regular</ToggleButton>
                <ToggleButton value="business">Business</ToggleButton>
            </ToggleButtonGroup>

            <Box>
                <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    sx={{ mb: 2 }}
                >
                    Choose Excel File
                    <VisuallyHiddenInput
                        type="file"
                        accept=".xlsx"
                        onChange={handleFileChange}
                    />
                </Button>

                {file && (
                    <Typography variant="body2" color="text.secondary">
                        Selected: {file.name}
                    </Typography>
                )}

                {isLoading && (
                    <Typography variant="body2" color="text.secondary">
                        Loading...
                    </Typography>
                )}

                {error && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                        {error}
                    </Typography>
                )}
            </Box>
        </Stack>
    )
}
