import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request, Response } from 'express';

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const contextType = context.getType<string>();
    if (contextType !== 'http' && contextType !== 'graphql') {
      return next.handle();
    }

    const start = Date.now();
    const graphQlContext =
      contextType === 'graphql'
        ? GqlExecutionContext.create(context).getContext<{ req?: Request; res?: Response }>()
        : null;
    const request =
      contextType === 'graphql'
        ? graphQlContext?.req
        : context.switchToHttp().getRequest<Request>();
    const response =
      contextType === 'graphql'
        ? graphQlContext?.res
        : context.switchToHttp().getResponse<Response>();

    if (!request || !response) {
      return next.handle();
    }

    const isApi = request.url.startsWith('/api/') || request.url.startsWith('/graphql');
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      const elapsed = Date.now() - start;
      console.log(`[${request.method}] ${request.url} — ${elapsed}ms`);
      if (isApi && !response.headersSent) {
        response.setHeader('X-Elapsed-Time', `${elapsed}ms`);
      }
    };

    if (!isApi) {
      const originalRender = response.render.bind(response);
      (response as any).render = (view: string, options: object = {}, callback?: any) => {
        const elapsed = Date.now() - start;
        console.log(`[${request.method}] ${request.url} — ${elapsed}ms`);
        return originalRender(view, { ...(options ?? {}), serverTime: elapsed }, callback);
      };
      return next.handle();
    }

    return next.handle().pipe(tap(finish));
  }
}
