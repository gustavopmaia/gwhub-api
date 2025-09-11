import { FastifyReply, FastifyRequest } from "fastify";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
  ) {
    super(message);
  }
}

function errorHandler(
  error: AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const statusCode =
    "statusCode" in error ? (error as AppError).statusCode : 500;
  reply.status(statusCode).send({
    message: error.message,
    statusCode,
  });
}

export default errorHandler;
