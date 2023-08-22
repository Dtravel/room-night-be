import { Injectable } from '@nestjs/common'
import { ethers } from 'ethers'
import { NonceManager } from '@ethersproject/experimental'
import { Provider } from './provider'

@Injectable()
export class BscProvider implements Provider {
    constructor() {
        this.etherProvider = new ethers.providers.JsonRpcProvider(process.env.BSC_PROVIDER)
        this.signer = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY, this.etherProvider)
        this.nonceManager = new NonceManager(this.signer)
    }

    private readonly etherProvider: ethers.providers.JsonRpcProvider
    private readonly signer: ethers.Wallet
    private readonly nonceManager: NonceManager

    getSigner(): ethers.Wallet {
        return this.signer
    }

    getEthersProvider(): ethers.providers.JsonRpcProvider {
        return this.etherProvider
    }

    getNonceManager(): NonceManager {
        return this.nonceManager
    }
}
