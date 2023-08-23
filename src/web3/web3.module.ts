import { Module } from '@nestjs/common'
import { BscProvider } from './bsc.provider'
import { Listener } from './listener'
@Module({
    imports: [],
    providers: [BscProvider, Listener],
    exports: [BscProvider],
})
export class Web3Module {}
