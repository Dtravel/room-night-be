import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { Web3Module } from './web3/web3.module'
import { ConfigModule } from '@nestjs/config'

@Module({
    imports: [ConfigModule.forRoot(), Web3Module],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
