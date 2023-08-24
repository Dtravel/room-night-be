import { Module, Global } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { PrismaListingService } from './prismaListing.service'

@Global()
@Module({
    providers: [PrismaService, PrismaListingService],
    exports: [PrismaService, PrismaListingService],
})
export class PrismaModule {}
