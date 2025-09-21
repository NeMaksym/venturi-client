import React, { useState } from 'react'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import CloudUpload from '@mui/icons-material/CloudUpload'
import { styled } from '@mui/system'

import { UploadPageProps } from '../../../types'
import { parsePrivateBankStatement } from '../utils/statementParser'

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

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setError(null)

        try {
            const selectedFile = getSelectedFile(event)

            setFile(selectedFile)

            setIsLoading(true)

            const transactions = await parsePrivateBankStatement(selectedFile)

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
        <Box sx={{ maxWidth: 600 }}>
            <Typography variant="h4" component="h2" gutterBottom>
                PrivatBank Business
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }} color="text.secondary">
                Upload your PrivatBank Business statement file here.
            </Typography>

            <Box sx={{ mb: 3 }}>
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
        </Box>
    )
}
