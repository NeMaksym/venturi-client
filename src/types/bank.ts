import { SourceTransaction } from './transaction'

/**
 * Props interface for upload page component.
 * @property {function} uploadData - Callback function to handle uploaded transaction data
 * @property {SourceTransaction[]} uploadData.data - Array of source transactions to upload
 */
export interface UploadPageProps {
    uploadData: (data: SourceTransaction[]) => void
}

/**
 * Represents a component that renders the upload page for a bank.
 */
export type BankUploadPage = React.ComponentType<UploadPageProps>

// TODO: Add bank icon
// TODO: Add .md upload instruction
/**
 * Represents a bank data to be used in the system.
 * @property {string} country - Country code where the bank operates (ISO 3166-1 alpha-2 )
 * @property {string} label - Human-readable name of the bank
 */
export interface BankManifest {
    country: string
    label: string
    UploadPage: BankUploadPage
}
