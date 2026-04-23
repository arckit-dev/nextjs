import type { Pipeline } from '../shared/types';
import { isRedirectError } from './action-error';
import type { ServerActionResult, ServerActionSuccess } from './result';

type AnyMiddleware = (ctx: Record<string, unknown>, rawInput: unknown) => Promise<{ ctx: Record<string, unknown> }>;

type MiddlewareEntry = AnyMiddleware | AnyMiddleware[];

const executeParallel = async (
  middlewares: AnyMiddleware[],
  ctx: Record<string, unknown>,
  rawInput: unknown
): Promise<Record<string, unknown>> => {
  const results = await Promise.all(middlewares.map((middleware) => middleware(ctx, rawInput)));
  return Object.assign({}, ctx, ...results.map((r) => r.ctx));
};

const toResolvedMiddleware =
  (rawInput: unknown) =>
  async (accPromise: Promise<Record<string, unknown>>, entry: MiddlewareEntry): Promise<Record<string, unknown>> => {
    const ctx = await accPromise;
    if (Array.isArray(entry)) return executeParallel(entry, ctx, rawInput);

    const result = await entry(ctx, rawInput);
    return { ...ctx, ...result.ctx };
  };

const toSuccessResult = <TResult>(result: ServerActionResult<TResult> | undefined): ServerActionSuccess<TResult> =>
  result == null || !('success' in result)
    ? { success: true, data: undefined as TResult }
    : (result as ServerActionSuccess<TResult>);

export const execute =
  <TCtx extends object, TExtra, TFin extends string>(pipeline: Pipeline<TCtx, TExtra, TFin>) =>
  <TResult = void>(
    handler: (ctx: TCtx) => Promise<ServerActionResult<TResult> | undefined>
  ): ((rawInput?: unknown) => Promise<ServerActionResult<TResult>>) =>
  async (rawInput?: unknown): Promise<ServerActionResult<TResult>> => {
    try {
      const ctx = await (pipeline.middlewares as unknown as MiddlewareEntry[]).reduce(
        toResolvedMiddleware(rawInput),
        Promise.resolve<Record<string, unknown>>({})
      );
      return toSuccessResult(await handler(ctx as TCtx));
    } catch (error: unknown) {
      if (isRedirectError(error)) throw error;
      return { success: false, error: 'error.500' };
    }
  };
