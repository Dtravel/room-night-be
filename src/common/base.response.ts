import { Paging } from './paging'
import { ErrorResponse } from './error.response'

export class BaseResponse<T = any> {
    public success: boolean
    public data: T
    public error?: ErrorResponse
    public paging?: Paging

    public static ok(data: any, paging?: Paging): BaseResponse {
        return <BaseResponse>{ success: true, data, paging }
    }

    public static of(data: any): BaseResponse {
        if (data instanceof BaseResponse) return data
        return <BaseResponse>{ success: true, ...data }
    }

    public static ofList(arr: any[], page: number, pageSize: number): BaseResponse {
        return <BaseResponse>{
            success: true,
            data: arr[0],
            paging: {
                page,
                pageSize,
                total: arr[1],
                totalPages: Math.ceil(arr[1] / pageSize),
            },
        }
    }
}
