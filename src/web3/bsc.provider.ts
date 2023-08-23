import { Injectable } from '@nestjs/common'
import { ethers } from 'ethers'
import { NonceManager } from '@ethersproject/experimental'

@Injectable()
export class BscProvider {
    constructor() {
        this.etherProvider = new ethers.providers.JsonRpcProvider(process.env.BSC_PROVIDER)
        this.wssProvider = new ethers.providers.WebSocketProvider(process.env.BSC_PROVIDER_WSS)
        this.signer = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY, this.etherProvider)
        this.nonceManager = new NonceManager(this.signer)
    }

    private readonly wssProvider: ethers.providers.WebSocketProvider
    private readonly etherProvider: ethers.providers.JsonRpcProvider
    private readonly signer: ethers.Wallet
    private readonly nonceManager: NonceManager

    getSigner(): ethers.Wallet {
        return this.signer
    }

    getNonceManager(): NonceManager {
        return this.nonceManager
    }

    getContract() {}

    getContractWss(contractAddress: string, contractABI: any) {
        return new ethers.Contract(contractAddress, contractABI, this.wssProvider)
    }

    async listenEventFromcontract(
        contractAddress: string,
        contractABI: string,
        eventName: string,
        handler: (from, to, value, event) => any,
    ): Promise<void> {
        // console.log(`Start listening from contract ${contractAddress} filter by event ${eventName}`)
        const contract = this.getContractWss(contractAddress, contractABI)
        contract.on(eventName, handler)
    }
}

/*{
    "from": "0x2933B9CD8B8608e2A879AB5449ad350d24276abf",
    "to": "0xD9144a485E3DeAE47edBb3282F3fD070C899c431",
    "value": {
        "type": "BigNumber",
        "hex": "0x3635c9adc5dea00000"
    },
    "eventData": {
        "blockNumber": 32697511,
        "blockHash": "0xd56d4925414cb0254813365b39bab017e91a1e69778f8cb6819bb1e6854589f9",
        "transactionIndex": 23,
        "removed": false,
        "address": "0x0062fC7642E7BD9b4685901258207A6e22E23378",
        "data": "0x00000000000000000000000000000000000000000000003635c9adc5dea00000",
        "topics": [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0x0000000000000000000000002933b9cd8b8608e2a879ab5449ad350d24276abf",
            "0x000000000000000000000000d9144a485e3deae47edbb3282f3fd070c899c431"
        ],
        "transactionHash": "0xbc35e7b7a11e19cfddafc087f37da332f47fd93f50df68873bb7f2b486bf4e8a",
        "logIndex": 47,
        "event": "Transfer",
        "eventSignature": "Transfer(address,address,uint256)",
        "args": [
            "0x2933B9CD8B8608e2A879AB5449ad350d24276abf",
            "0xD9144a485E3DeAE47edBb3282F3fD070C899c431",
            {
                "type": "BigNumber",
                "hex": "0x3635c9adc5dea00000"
            }
        ]
    }
} */
