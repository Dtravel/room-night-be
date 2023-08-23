import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { AppService } from './app.service'
import { UpdateReservationDto } from './dto/UpdateReservation.dto'
import { BaseResponse } from './common/base.response'

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello()
    }
    // API listing all listing for host
    @Get('/listing/:hostId')
    getListingByWalletAddress(@Param('hostId') hostId: string): string {
        return 'listing'
    }

    // API update transactionHash to reservation
    @Post('/reservation/:reservationId')
    updateTransactionHashToReservation(
        @Param('reservationId') reservationId: string,
        @Body() updateDto: UpdateReservationDto,
    ): Promise<BaseResponse> {
        return this.appService.updateReservation(reservationId, updateDto).then(BaseResponse.ok)
    }
}
