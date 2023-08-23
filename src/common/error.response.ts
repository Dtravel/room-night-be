export class ErrorResponse {
    code: string
    message: string
    error: string

    constructor(code: string, message: string) {
        this.code = code
        this.message = message
    }

    public static of(code: string, message: string): ErrorResponse {
        return new ErrorResponse(code, message)
    }
}
