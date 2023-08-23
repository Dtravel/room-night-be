import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ethers } from 'ethers'
import { BscProvider } from './bsc.provider'
import { FACTORY_ABI, TOKEN_ABI } from './abi/ABIs'
const USDT_ADDRESS = '0x0062fC7642E7BD9b4685901258207A6e22E23378'
const FACTORY_ADDRESS = '0x15d0597d0ef4EcE16421D4DE48387cBAe3B2f6BD'
const OPS_ADDRESS = '0xD9144a485E3DeAE47edBb3282F3fD070C899c431'

@Injectable()
export class Listener implements OnModuleInit, OnModuleDestroy {
    constructor(private readonly bscProvider: BscProvider) {}
    async onModuleInit() {
        this.bscProvider.listenEventFromcontract(
            USDT_ADDRESS,
            JSON.stringify(TOKEN_ABI),
            'Transfer',
            (from, to, value, event) => {
                console.log(`from: ${from}, to: ${to}, value: ${value}, event: ${event}`)
            },
        )
    }

    async onModuleDestroy() {}
}
