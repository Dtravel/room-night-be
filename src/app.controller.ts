import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { AppService } from './app.service'
import { UpdateReservationDto } from './dto/UpdateReservation.dto'
import { BaseResponse } from './common/base.response'

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get('/health')
    healthCheck(): string {
        return 'OK'
    }

    @Get('/operator')
    getOperatorAddress(@Param('hostId') hostId: string): BaseResponse {
        return BaseResponse.ok(process.env.OPERATOR_ADDRESS)
    }
    // API listing all listing for host
    @Get('/listing/:hostId')
    getListingByWalletAddress(@Param('hostId') hostId: string): string {
        return 'listing'
    }
    @Post('/listing/:hostAddress/:listingId/deploy')
    deployRoomNightToken(@Param('hostAddress') hostAddress: string, @Param('listingId') listingId: string) {
        return this.appService.deployRoomNightToken(hostAddress, listingId).then(BaseResponse.ok)
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
