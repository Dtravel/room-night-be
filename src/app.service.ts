import { Injectable } from '@nestjs/common'
import { UpdateReservationDto } from './dto/UpdateReservation.dto'
import { PrismaService } from './connections/prisma.service'

@Injectable()
export class AppService {
    constructor(private readonly prismaService: PrismaService) {}
    getHello(): string {
        return 'Hello World!'
    }

    updateReservation(resId: string, updateDto: UpdateReservationDto) {
        return this.prismaService.reservation_mapping.upsert({
            where: {
                reservation_id: resId,
            },
            update: {
                transaction_hash: updateDto.transactionHash,
            },
            create: {
                reservation_id: resId,
                transaction_hash: updateDto.transactionHash,
            },
        })
    }
}
