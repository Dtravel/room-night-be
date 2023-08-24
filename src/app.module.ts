import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { Web3Module } from './web3/web3.module'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './connections/prisma.module'
import { Listener } from './listener'

@Module({
    imports: [ConfigModule.forRoot(), Web3Module, PrismaModule],
    controllers: [AppController],
    providers: [AppService, Listener],
})
export class AppModule {}
