export class AppError extends Error {
    message;
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
    }
}
function errorHandler(error, request, reply) {
    const statusCode = "statusCode" in error ? error.statusCode : 500;
    reply.status(statusCode).send({
        message: error.message,
        statusCode,
    });
}
export default errorHandler;
