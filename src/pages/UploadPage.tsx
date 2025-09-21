import { useState } from 'react'
import Box from '@mui/material/Box'

import {
    PageLayout,
    BankSelector,
    UploadResultsRenderer,
    UploadFooter,
    CustomStepper,
} from '../components'
import { bankProvider } from '../plugins'
import { SourceTransaction } from '../types'

const STEPS = ['Select Bank', 'Provide Data', 'Results']

export const UploadPage: React.FC = () => {
    const [activeStep, setActiveStep] = useState<number>(0)
    const handleNext = () => setActiveStep((prevStep) => prevStep + 1)
    const handleBack = () => setActiveStep((prevStep) => prevStep - 1)

    const [bankId, setBankId] = useState<string>(
        bankProvider.labelOptions[0]?.value ?? ''
    )
    const [data, setData] = useState<SourceTransaction[] | null>(null)

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                // TODO: Cards with icons instead of selector
                return (
                    <BankSelector
                        value={bankId}
                        onChange={(value) => setBankId(value)}
                        options={bankProvider.labelOptions}
                    />
                )
            case 1: {
                // TODO: Create layout page for uploader. Plugin should provide only the upload logic.
                // And layout should be responsible for shared elements (header, button, mb bank/country icons)
                const UploaderComponent = bankProvider.getUploadPageById(bankId)
                return UploaderComponent ? (
                    <UploaderComponent uploadData={(data) => setData(data)} />
                ) : null
            }
            case 2: {
                return (
                    <UploadResultsRenderer
                        bankId={bankId}
                        sourceTransactions={data ?? []}
                    />
                )
            }
            default:
                throw new Error('Unknown step')
        }
    }

    return (
        <PageLayout
            title={
                activeStep === 0 ? 'Upload' : bankProvider.getLabelById(bankId)
            }
        >
            <Box sx={{ width: '100%', mt: 2 }}>
                <CustomStepper activeStep={activeStep} steps={STEPS} />

                <Box sx={{ mt: 4, ml: 2 }}>{renderStepContent(activeStep)}</Box>

                <UploadFooter
                    onBack={() => {
                        setData(null)
                        handleBack()
                    }}
                    isBackDisabled={activeStep === 0}
                    onNext={handleNext}
                    isNextDisabled={
                        activeStep === STEPS.length - 1 ||
                        (activeStep === 1 && !data)
                    }
                />
            </Box>
        </PageLayout>
    )
}
