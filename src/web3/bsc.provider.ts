import { NonceManager } from '@ethersproject/experimental'
import { Injectable } from '@nestjs/common'
import { ethers } from 'ethers'
import { IEventData } from './types'
import { Utils } from '../common/utils'

@Injectable()
export class BscProvider {
    constructor() {
        this.etherProvider = new ethers.providers.JsonRpcProvider(process.env.BSC_PROVIDER)
        this.signer = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY, this.etherProvider)
        this.nonceManager = new NonceManager(this.signer)
    }

    private latestBlock: number
    private readonly etherProvider: ethers.providers.JsonRpcProvider
    private readonly signer: ethers.Wallet
    private readonly nonceManager: NonceManager

    getSigner(): ethers.Wallet {
        return this.signer
    }

    getNonceManager(): NonceManager {
        return this.nonceManager
    }

    getContract(contractAddress: string, contractABI: any): ethers.Contract {
        return new ethers.Contract(contractAddress, contractABI, this.nonceManager)
    }

    getGasPrice(): Promise<ethers.BigNumber> {
        return this.etherProvider.getGasPrice()
    }

    async queryFilter(contractAddress: string, contractABI: string, eventName: string): Promise<IEventData[]> {
        if (!this.latestBlock) {
            this.latestBlock = (await this.etherProvider.getBlock('latest')).number
        }
        console.log('🚀 ~ file: bsc.provider.ts:54 ~ BscProvider ~ queryFilter ~ this.latestBlock:', this.latestBlock)
        const PAGE_SIZE = 20
        let events = await this.getContract(contractAddress, contractABI).queryFilter(
            eventName,
            this.latestBlock,
            this.latestBlock + PAGE_SIZE,
        )
        let eventDatas = await Promise.all(events.map(this.convertEventData))
        if (eventDatas.length > 0) {
            this.latestBlock = eventDatas[eventDatas.length - 1].blockNumber + 1
        } else {
            const latestBlock = (await this.etherProvider.getBlock('latest')).number
            if (latestBlock <= this.latestBlock + PAGE_SIZE) {
                if (latestBlock < this.latestBlock) {
                    // do nothing
                    console.log(`latestBlock < this.latestBlock`, latestBlock, this.latestBlock)
                } else {
                    this.latestBlock = latestBlock
                }
            } else {
                this.latestBlock += PAGE_SIZE
            }
        }
        return eventDatas
    }

    async queryFilterEventsInterval(
        contractAddress: string,
        contractABI: string,
        eventName: string,
        handler: (event: IEventData) => Promise<any>,
        interval: number,
    ) {
        let events = await this.queryFilter(contractAddress, contractABI, eventName)
        for (let event of events) {
            await handler(event)
        }
        setTimeout(() => {
            this.queryFilterEventsInterval(contractAddress, contractABI, eventName, handler, interval)
        }, interval)
    }

    async convertEventData(event): Promise<IEventData> {
        try {
            const [block, receipt] = await Promise.all([event.getBlock(), event.getTransactionReceipt()])
            const eventData: IEventData = {
                name: event.event,
                contract: event.address,
                timestamp: block.timestamp,
                blockHash: event.blockHash,
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                transactionIndex: event.transactionIndex,
                from: receipt.from,
                to: receipt.to,
                logIndex: event.logIndex,
                values: {},
            }
            eventData.values = Utils.parseEventArgs(event.args)
            return eventData
        } catch (e) {
            throw e
        }
    }
}
