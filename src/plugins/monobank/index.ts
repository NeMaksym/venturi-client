import { bankProvider } from '../bankProvider'
import { BankManifest } from '../../types'
import { UploadPage } from './components/UploadPage'

const monobankManifest: BankManifest = {
    country: 'ua',
    label: 'Monobank',
    UploadPage,
}

bankProvider.add('hMDykC', monobankManifest)
