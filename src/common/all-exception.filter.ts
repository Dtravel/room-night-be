import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { ErrorResponse } from './error.response'
import { BaseResponse } from './base.response'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private logger: Logger = new Logger(AllExceptionsFilter.name)

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
        this.logger.error(exception)
        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus)
    }
}
