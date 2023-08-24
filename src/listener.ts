import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { AppService } from './app.service'
import { FACTORY_ADDRESS, USDT_ADDRESS } from './common/const'
import { Utils } from './common/utils'
import { FACTORY_ABI, TOKEN_ABI } from './web3/abi/ABIs'
import { BscProvider } from './web3/bsc.provider'

@Injectable()
export class Listener implements OnModuleInit, OnModuleDestroy {
    constructor(private readonly appService: AppService, private readonly bscProvider: BscProvider) {}
    async onModuleInit() {
        this.bscProvider.listenEventFromcontract(
            USDT_ADDRESS,
            JSON.stringify(TOKEN_ABI),
            'Transfer',
            async (from, to, value, event) => {
                await Utils.sleep(5000)
                console.log(`from: ${from}, to: ${to}, value: ${value}, event: ${event}`)
                if (to.toLowerCase() !== process.env.OPERATOR_ADDRESS.toLowerCase()) {
                    console.log(`to address is not operator address`, process.env.OPERATOR_ADDRESS)
                    return
                }
                await this.appService.confirmReservation(event.transactionHash, value.toString())
            },
        )

        this.bscProvider.listenEventFromcontract(
            FACTORY_ADDRESS,
            JSON.stringify(FACTORY_ABI),
            'NewProperty',
            async (from, to, value, event) => {
                console.log(event)
                let [propertyId, roomNightToken, hostAddress] = event.args
                console.log('🚀 ~ file: listener.ts:28 ~ Listener ~ onModuleInit ~ hostAddress:', hostAddress)
                console.log('🚀 ~ file: listener.ts:28 ~ Listener ~ onModuleInit ~ roomNightToken:', roomNightToken)
                console.log('🚀 ~ file: listener.ts:28 ~ Listener ~ onModuleInit ~ propertyId:', propertyId)
                await this.appService.updateListingMapping(
                    propertyId.toString(),
                    roomNightToken.toString().toLowerCase(),
                    hostAddress.toString().toLowerCase(),
                )
            },
        )
    }

    async onModuleDestroy() {}
}
