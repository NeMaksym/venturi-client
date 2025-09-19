import React from 'react'
import Button from '@mui/material/Button'

import { PageLayout } from '../components'
import { DBProvider, DB_CONFIG } from '../db/provider'

export const DebugPage: React.FC = () => {
    const handleResetDatabase = () => {
        if ('indexedDB' in window) {
            DBProvider.instance.close()

            const deleteResult = indexedDB.deleteDatabase(DB_CONFIG.name)

            deleteResult.onsuccess = () => {
                window.location.reload()
            }

            deleteResult.onerror = () => {
                console.error('Failed to delete database')
            }
        }
    }

    return (
        <PageLayout title="Debug Information">
            <Button
                sx={{ width: '200px' }}
                variant="contained"
                color="error"
                onClick={handleResetDatabase}
            >
                Reset Database
            </Button>
        </PageLayout>
    )
}
