import { bankProvider } from './bankProvider'

import { monobankManifest } from './monobank'
import { privatBankManifest } from './privatBank'

bankProvider.add('hMDykC', monobankManifest).add('Hr09x8', privatBankManifest)

export * from './bankProvider'
