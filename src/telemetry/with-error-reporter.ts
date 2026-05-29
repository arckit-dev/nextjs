import type { ErrorAttributes, ErrorLevel, ErrorReporter } from '@arckit/telemetry';
import type { PipeMiddleware, ServerActionResult } from '../action';
import type { Scheduler } from './scheduler';

type AttributesExtractor<TCtx> = (ctx: TCtx) => ErrorAttributes;

type WithErrorReporterOptions<TCtx> = {
  readonly level?: ErrorLevel;
  readonly extractAttributes?: AttributesExtractor<TCtx>;
};

const toError = (caught: unknown): Error => (caught instanceof Error ? caught : new Error(String(caught)));

export const withErrorReporter =
  (reporter: ErrorReporter, schedule: Scheduler) =>
  <TCtx extends object>(
    event: string,
    { level = 'error', extractAttributes }: WithErrorReporterOptions<TCtx> = {}
  ): PipeMiddleware<TCtx, object, unknown> =>
  async (ctx, _rawInput, next): Promise<ServerActionResult<unknown>> => {
    try {
      return await next(ctx);
    } catch (caught) {
      schedule(() => {
        reporter.captureException({
          error: toError(caught),
          level,
          attributes: { event, ...(extractAttributes?.(ctx) ?? {}) }
        });
      });
      throw caught;
    }
  };
