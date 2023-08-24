import { Injectable } from '@nestjs/common'
import { UpdateReservationDto } from './dto/UpdateReservation.dto'
import { PrismaService } from './connections/prisma.service'
import { BscProvider } from './web3/bsc.provider'
import { FACTORY_ABI, ROOM_NIGHT_ABI } from './web3/abi/ABIs'
import { Utils } from './common/utils'
import { FACTORY_ADDRESS, SAMPLE_GUEST_ADDRESS, SAMPLE_HOST_ADDRESS } from './common/const'

@Injectable()
export class AppService {
    constructor(private readonly prismaService: PrismaService, private readonly bscProvider: BscProvider) {}
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

    async updateListingMapping(listingId: string, nftAddress: string, hostAddress: string): Promise<any> {
        return this.prismaService.listing_mapping.create({
            data: {
                listing_id: listingId,
                room_night_token: nftAddress,
                host_address: hostAddress,
            },
        })
    }

    async confirmReservation(transactionHash: string, value: any) {
        // verify transactionHash
        let reservationMapping = await this.prismaService.reservation_mapping.findUnique({
            where: {
                transaction_hash: transactionHash,
            },
        })
        let reservation = await this.prismaService.reservation.findUnique({
            where: {
                reservation_id: reservationMapping.reservation_id,
            },
        })
        if (!reservationMapping || !reservation) return false
        // TODO: verify value of transaction
        // Update reservation status
        await this.prismaService.reservation.update({
            where: {
                reservation_id: reservationMapping.reservation_id,
            },
            data: {
                status: 'new',
            },
        })

        let listingMapping = await this.prismaService.listing_mapping.findFirst({
            where: {
                listing_id: `${reservation.listing_id}`,
            },
        })
        // transfer tokens from host to guest
        let { checkinDate, checkoutDate } = reservation
        let dateRangeTokenIDs = Utils.getDateInRange(checkinDate, checkoutDate)
        dateRangeTokenIDs = [1694563200]
        console.log(
            '🚀 ~ file: app.service.ts:73 ~ AppService ~ confirmReservation ~ dateRangeTokenIDs:',
            dateRangeTokenIDs,
        )

        let contract = this.bscProvider.getContract(listingMapping.room_night_token, ROOM_NIGHT_ABI)
        let gasPrice = await this.bscProvider.getGasPrice()
        const estimateGas = await contract.estimateGas.safeBatchTransferFrom(
            SAMPLE_HOST_ADDRESS,
            SAMPLE_GUEST_ADDRESS,
            dateRangeTokenIDs,
        )

        const unsignedTx = await contract.populateTransaction.safeBatchTransferFrom(
            SAMPLE_HOST_ADDRESS,
            SAMPLE_GUEST_ADDRESS,
            dateRangeTokenIDs,
            {
                gasLimit: estimateGas.add(Utils.calculateAdditionalGasLimit(Number(estimateGas.toString()))),
                gasPrice: gasPrice.add(gasPrice.div(10)),
            },
        )

        const tx = await this.bscProvider.getNonceManager().sendTransaction(unsignedTx)
        const receipt = await tx.wait()
        if (receipt && receipt.transactionHash) {
            console.log('🚀 ~ file: app.service.ts:85 ~ AppService ~ confirmReservation ~ receipt:', receipt)
            console.log(receipt)
        }
        return receipt
        // update calendar
    }
}
