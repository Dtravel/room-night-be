export interface IEventData {
    name: string
    contract: string
    timestamp: number
    blockHash: string
    blockNumber: number
    transactionHash: string
    transactionIndex: number
    from: string
    to: string
    logIndex: number
    values: any
}
