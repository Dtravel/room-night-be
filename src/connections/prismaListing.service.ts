import { PrismaClient } from '@internal/prisma-listing/client'
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common'

@Injectable()
export class PrismaListingService extends PrismaClient implements OnModuleInit {
    constructor() {
        super({
            log:
                process.env.ENV !== 'prod'
                    ? [
                          { level: 'error', emit: 'stdout' },
                          { level: 'query', emit: 'event' },
                      ]
                    : [{ level: 'error', emit: 'stdout' }],
            errorFormat: 'pretty',
        })
        // this.$on<any>('query', (event: Prisma.QueryEvent) => {
        // console.log('Query: ' + event.query)
        // console.log('Duration: ' + event.duration + 'ms')
        // })
    }
    async onModuleInit() {
        await this.$connect()
    }

    async onModuleDestroy() {
        await this.$disconnect()
    }

    async enableShutdownHooks(app: INestApplication) {
        this.$on('beforeExit', async () => {
            await app.close()
        })
    }
}
