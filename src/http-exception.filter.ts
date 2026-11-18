import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import type { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Запись не найдена';
      } else if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        message = 'Запись с такими данными уже существует';
      }
    }

    if (host.getType<'graphql'>() === 'graphql')  {
      const gqlHost = GqlArgumentsHost.create(host);
      const ctx = gqlHost.getContext();
      const request = ctx.req;
      console.error(`[GraphQL] → ${status}:`, exception);
      throw exception; 
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    console.error(`[${request.method}] ${request.url} → ${status}:`, exception);

    if (request.url.startsWith('/api')) {
      response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else {
      response.status(status).render('error', { message, status });
    }
  }
}