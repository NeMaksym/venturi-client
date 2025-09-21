import { useState } from 'react'
import Stack from '@mui/material/Stack'

import {
    PageLayout,
    BankCards,
    UploadResultsRenderer,
    UploadStepperControls,
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
                return (
                    <BankCards
                        value={bankId}
                        onClick={(value) => setBankId(value)}
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
            header={
                <UploadStepperControls
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
            }
        >
            <Stack spacing={4}>
                <CustomStepper activeStep={activeStep} steps={STEPS} />
                {renderStepContent(activeStep)}
            </Stack>
        </PageLayout>
    )
}
