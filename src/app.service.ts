import { BadRequestException, Injectable } from '@nestjs/common'
import { Decimal } from '@prisma/client/runtime'
import * as dayjs from 'dayjs'
import { ethers } from 'ethers'
import { FACTORY_ADDRESS } from './common/const'
import { Utils } from './common/utils'
import { PrismaService } from './connections/prisma.service'
import { PrismaListingService } from './connections/prismaListing.service'
import { UpdateReservationDto } from './dto/UpdateReservation.dto'
import { FACTORY_ABI, ROOM_NIGHT_ABI } from './web3/abi/ABIs'
import { BscProvider } from './web3/bsc.provider'

@Injectable()
export class AppService {
    factoryContract: ethers.Contract
    constructor(
        private readonly prismaService: PrismaService,
        private readonly prismaListingService: PrismaListingService,
        private readonly bscProvider: BscProvider,
    ) {
        this.factoryContract = this.bscProvider.getContract(FACTORY_ADDRESS, FACTORY_ABI)
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

    async deployRoomNightToken(hostAddress: string, listingId: string) {
        let gasPrice = await this.bscProvider.getGasPrice()
        const estimateGas = await this.factoryContract.estimateGas.createRoomNightToken(
            listingId,
            hostAddress,
            `RNT#${listingId}`,
            `RNT#${listingId}`,
            `https://guest.dtravel.xyz/${hostAddress}/property/${listingId}`,
            100,
        )

        const unsignedTx = await this.factoryContract.populateTransaction.createRoomNightToken(
            listingId,
            hostAddress,
            `RNT#${listingId}`,
            `RNT#${listingId}`,
            `https://guest.dtravel.xyz/${hostAddress}/property/${listingId}`,
            100,
            {
                gasLimit: estimateGas.add(Utils.calculateAdditionalGasLimit(Number(estimateGas.toString()))),
                gasPrice: gasPrice.add(gasPrice.div(10)),
            },
        )

        const tx = await this.bscProvider.getNonceManager().sendTransaction(unsignedTx)
        const receipt = await tx.wait()
        let iface = new ethers.utils.Interface(FACTORY_ABI)
        const newPropertEvent = receipt.logs.map((log) => iface.parseLog(log)).find((log) => log.name === 'NewProperty')
        console.log(
            '🚀 ~ file: app.service.ts:67 ~ AppService ~ deployRoomNightToken ~ newPropertEvent:',
            newPropertEvent,
        )
        const args = Utils.parseEventArgs(newPropertEvent.args)
        await this.updateListingMapping(
            listingId,
            args['rnt'].toString().toLowerCase(),
            hostAddress.toString().toLowerCase(),
        )
        return receipt
    }

    async getListingMapping(listingId: string) {
        return this.prismaService.listing_mapping.findFirst({
            where: {
                listing_id: listingId,
            },
        })
    }
    async getReservationsByListingId(listingId: string) {
        return this.prismaService.reservation_mapping.findMany({
            where: {
                listing_id: listingId,
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

    async confirmReservation(transactionHash: string, value: string, fromAddress: string) {
        await Utils.sleep(2000)
        // verify transactionHash
        let reservationMapping = await this.prismaService.reservation_mapping.findUnique({
            where: {
                transaction_hash: transactionHash,
            },
        })
        if (!reservationMapping) {
            console.log(`Reservation not found with transactionHash: ${transactionHash}`)
            return false
        }
        let reservation = await this.prismaService.reservation.findUnique({
            where: {
                reservation_id: reservationMapping.reservation_id,
            },
        })
        if (!reservation) {
            console.log(`Reservation not found with reservation_id: ${reservationMapping.reservation_id}`)
            return false
        }

        // TODO: verify value of transaction
        let valueEther = ethers.utils.formatEther(value)
        let slippagePercent = new Decimal(valueEther)
            .minus(reservation.final_price)
            .abs()
            .div(reservation.final_price)
            .mul(100)
        if (slippagePercent.greaterThan(10)) {
            throw new BadRequestException(
                `slippagePercent is greater than 10: ${valueEther} vs ${reservation.final_price}`,
            )
        }
        let listingMapping = await this.prismaService.listing_mapping.findFirst({
            where: {
                listing_id: `${reservation.listing_id}`,
            },
        })
        console.log('🚀 ~ file: app.service.ts:146 ~ AppService ~ confirmReservation ~ listingMapping:', listingMapping)

        if (!listingMapping) {
            throw new BadRequestException(`Listing mapping not found with listing_id: ${reservation.listing_id}`)
        }
        // transfer tokens from host to guest
        let { checkinDate, checkoutDate, host_wallet, guest_wallet } = reservation
        let dateRangeTokenIDs = Utils.getDateInRange(checkinDate, checkoutDate)
        console.log(
            '🚀 ~ file: app.service.ts:73 ~ AppService ~ confirmReservation ~ dateRangeTokenIDs:',
            dateRangeTokenIDs,
        )

        let contract = this.bscProvider.getContract(listingMapping.room_night_token, ROOM_NIGHT_ABI)
        let gasPrice = await this.bscProvider.getGasPrice()
        const estimateGas = await contract.estimateGas.safeBatchTransferFrom(
            host_wallet,
            fromAddress,
            dateRangeTokenIDs,
        )

        const unsignedTx = await contract.populateTransaction.safeBatchTransferFrom(
            host_wallet,
            fromAddress,
            dateRangeTokenIDs,
            {
                gasLimit: estimateGas.add(Utils.calculateAdditionalGasLimit(Number(estimateGas.toString()))),
                gasPrice: gasPrice.add(gasPrice.div(10)),
            },
        )

        const tx = await this.bscProvider.getNonceManager().sendTransaction(unsignedTx)
        const receipt = await tx.wait()
        console.log('🚀 ~ file: app.service.ts:85 ~ AppService ~ confirmReservation ~ receipt:', receipt)
        // Store to reservation
        // Update reservation status
        Promise.all([
            this.prismaService.reservation.update({
                where: {
                    reservation_id: reservationMapping.reservation_id,
                },
                data: {
                    status: 'new',
                },
            }),
            this.prismaService.reservation_mapping.update({
                where: {
                    reservation_id: reservationMapping.reservation_id,
                },
                data: {
                    booking_transaction_hash: receipt.transactionHash,
                    booking_at: new Date(),
                    booking_amount: valueEther,
                    listing_id: `${reservation.listing_id}`,
                },
            }),
            this.prismaListingService.calendar.updateMany({
                where: {
                    date: {
                        gte: dayjs(checkinDate).format('YYYY-MM-DD'),
                        lt: dayjs(checkoutDate).format('YYYY-MM-DD'),
                    },
                    property_id: reservation.listing_id,
                },
                data: {
                    is_available: false,
                    status: 'reserved',
                },
            }),
        ])
        return receipt
    }
}
