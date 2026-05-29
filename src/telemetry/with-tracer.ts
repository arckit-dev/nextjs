import type { StartSpanOptions, Tracer } from '@arckit/telemetry';
import type { PipeMiddleware, ServerActionResult } from '../action';

export const withTracer =
  (tracer: Tracer) =>
  <TCtx extends object>(name: string, options?: StartSpanOptions): PipeMiddleware<TCtx, object, unknown> =>
  async (ctx, _rawInput, next): Promise<ServerActionResult<unknown>> =>
    tracer.startSpan(name, async () => next(ctx), options);
