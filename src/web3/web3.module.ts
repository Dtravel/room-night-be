import { Module } from '@nestjs/common'
import { BscProvider } from './bsc.provider'
@Module({
    imports: [],
    providers: [BscProvider],
    exports: [BscProvider],
})
export class Web3Module {}
