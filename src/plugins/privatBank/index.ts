import { bankProvider } from '../bankProvider'
import { BankManifest } from '../../types'
import { UploadPage } from './components/UploadPage'

const privatBankManifest: BankManifest = {
    country: 'ua',
    label: 'PrivatBank',
    UploadPage,
}

bankProvider.add('Hr09x8', privatBankManifest)
