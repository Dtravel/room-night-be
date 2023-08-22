import { ethers } from 'ethers'
import { NonceManager } from '@ethersproject/experimental'

export interface Provider {
    getSigner(): ethers.Wallet

    getEthersProvider(): ethers.providers.JsonRpcProvider

    getNonceManager(): NonceManager
}
