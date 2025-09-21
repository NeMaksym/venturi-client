import { bankProvider } from './bankProvider'

import { monobankManifest } from './monobank'
import { privatBankManifest } from './privatBank'
import { privatBankBusinessManifest } from './privatBankBusiness'

bankProvider
    .add('hMDykC', monobankManifest)
    .add('Hr09x8', privatBankManifest)
    .add('bLZNWi', privatBankBusinessManifest)

export * from './bankProvider'
