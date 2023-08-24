import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { BaseResponse } from './base.response'
import { ErrorResponse } from './error.response'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

    catch(exception: Error, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost

        const ctx = host.switchToHttp()
        const httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
        let responseBody = new BaseResponse()
        responseBody.success = false
        if (exception instanceof HttpException) {
            responseBody.error = { ...(<ErrorResponse>exception.getResponse()), error: exception.name }
        } else {
            responseBody.error = new ErrorResponse('0', exception.message)
        }
        console.error(exception)
        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus)
    }
}
