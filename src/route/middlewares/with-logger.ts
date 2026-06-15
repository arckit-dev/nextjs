import type { LogAttributes, Logger, LogLevel } from '@arckit/telemetry';
import type { NextRequest } from 'next/server';
import { preservingAfter } from '../../telemetry/preserving-after';
import type { Scheduler } from '../../telemetry/scheduler';

type RequestContext = { readonly request: NextRequest };

type AttributesExtractor<TCtx> = (ctx: TCtx) => LogAttributes;

type WithLoggerOptions<TCtx> = {
  readonly level?: LogLevel;
  readonly extractAttributes?: AttributesExtractor<TCtx>;
};

const requestAttributes = (request: NextRequest): LogAttributes => ({
  method: request.method,
  path: request.nextUrl.pathname
});

const errorType = (error: unknown): string => (error instanceof Error ? error.name : 'unknown');

export const createWithLogger =
  (logger: Logger, schedule: Scheduler = preservingAfter) =>
  <TCtx extends RequestContext>(event: string, { level = 'info', extractAttributes }: WithLoggerOptions<TCtx> = {}) =>
  (handler: (ctx: TCtx) => Promise<Response>) =>
  async (ctx: TCtx): Promise<Response> => {
    const start = performance.now();
    try {
      const response = await handler(ctx);
      const durationMs = Math.round(performance.now() - start);
      schedule(() => {
        logger.log({
          level,
          event: `${event}:success`,
          attributes: {
            ...requestAttributes(ctx.request),
            status: response.status,
            durationMs,
            ...(extractAttributes?.(ctx) ?? {})
          }
        });
      });
      return response;
    } catch (error) {
      const durationMs = Math.round(performance.now() - start);
      schedule(() => {
        logger.log({
          level,
          event: `${event}:failure`,
          attributes: {
            ...requestAttributes(ctx.request),
            durationMs,
            'error.type': errorType(error),
            ...(extractAttributes?.(ctx) ?? {})
          }
        });
      });
      throw error;
    }
  };
