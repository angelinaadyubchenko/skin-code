import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { createHash } from 'crypto';
import type { Request, Response } from 'express';

@Injectable()
export class ETagInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') return next.handle();

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    if (request.method !== 'GET' || !request.url.startsWith('/api/')) {
      return next.handle();
    }

    const originalJson = response.json.bind(response);
    const originalSend = response.send.bind(response);
    let handled = false;

    const applyEtag = (body: unknown, sender: (payload?: unknown) => Response) => {
      if (handled || response.headersSent || body == null) {
        return sender(body);
      }

      handled = true;
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      const etag = `"${createHash('md5').update(payload).digest('hex')}"`;
      response.setHeader('ETag', etag);

      if (request.headers['if-none-match'] === etag) {
        response.status(304);
        response.removeHeader('Content-Type');
        response.removeHeader('Content-Length');
        return response.end();
      }

      return sender(body);
    };

    response.json = (body?: unknown) => applyEtag(body, originalJson);
    response.send = (body?: unknown) => applyEtag(body, originalSend);

    return next.handle();
  }
}
