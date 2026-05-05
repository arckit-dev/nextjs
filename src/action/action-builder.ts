import type { ServerActionResult } from './result';

type Merge<A extends object, B extends object> = Omit<A, keyof B> & B;

type Next<TCtx extends object, TResult, TError extends string> = (ctx: TCtx) => Promise<ServerActionResult<TResult, TError>>;

export type PipeMiddleware<TCtxIn extends object, TCtxOut extends object, TResult, TError extends string = string> = (
  ctx: TCtxIn,
  rawInput: unknown,
  next: Next<TCtxOut, TResult, TError>
) => Promise<ServerActionResult<TResult, TError>>;

type AnyPipeMiddleware = PipeMiddleware<Record<string, unknown>, Record<string, unknown>, unknown, string>;

type MiddlewareEntry = AnyPipeMiddleware | AnyPipeMiddleware[];

interface ActionBuilder<TCtx extends object> {
  use<O1 extends object>(m1: PipeMiddleware<TCtx, O1, unknown, string>): ActionBuilder<Merge<TCtx, O1>>;

  use<O1 extends object, O2 extends object>(
    m1: PipeMiddleware<TCtx, O1, unknown, string>,
    m2: PipeMiddleware<TCtx, O2, unknown, string>
  ): ActionBuilder<Merge<Merge<TCtx, O1>, O2>>;

  use<O1 extends object, O2 extends object, O3 extends object>(
    m1: PipeMiddleware<TCtx, O1, unknown, string>,
    m2: PipeMiddleware<TCtx, O2, unknown, string>,
    m3: PipeMiddleware<TCtx, O3, unknown, string>
  ): ActionBuilder<Merge<Merge<Merge<TCtx, O1>, O2>, O3>>;

  use<O1 extends object, O2 extends object, O3 extends object, O4 extends object>(
    m1: PipeMiddleware<TCtx, O1, unknown, string>,
    m2: PipeMiddleware<TCtx, O2, unknown, string>,
    m3: PipeMiddleware<TCtx, O3, unknown, string>,
    m4: PipeMiddleware<TCtx, O4, unknown, string>
  ): ActionBuilder<Merge<Merge<Merge<Merge<TCtx, O1>, O2>, O3>, O4>>;

  execute<TResult = undefined, TError extends string = string>(
    handler: (ctx: TCtx) => Promise<ServerActionResult<TResult, TError> | TResult | undefined>
  ): (input?: unknown) => Promise<ServerActionResult<TResult, TError>>;
}

const toSuccessResult = <TResult, TError extends string>(
  result: ServerActionResult<TResult, TError> | TResult | undefined
): ServerActionResult<TResult, TError> => {
  if (result == null) return { success: true, data: undefined as TResult };
  if (typeof result === 'object' && 'success' in result) return result;
  return { success: true, data: result };
};

const executeParallel = async <TResult, TError extends string>(
  middlewares: AnyPipeMiddleware[],
  ctx: Record<string, unknown>,
  rawInput: unknown,
  next: Next<Record<string, unknown>, TResult, TError>
): Promise<ServerActionResult<TResult, TError>> => {
  const results = await Promise.all(
    middlewares.map(
      (middleware) =>
        new Promise<Record<string, unknown>>((resolve, reject) => {
          middleware(ctx, rawInput, async (nextCtx) => {
            resolve(nextCtx);
            return { success: true, data: undefined } as ServerActionResult<TResult, TError>;
          }).catch(reject);
        })
    )
  );
  const mergedCtx = results.reduce<Record<string, unknown>>((acc, result) => ({ ...acc, ...result }), ctx);
  return next(mergedCtx);
};

const buildPipeline = <TResult, TError extends string>(
  entries: MiddlewareEntry[],
  handler: (ctx: Record<string, unknown>) => Promise<ServerActionResult<TResult, TError> | TResult | undefined>
): ((ctx: Record<string, unknown>, rawInput: unknown) => Promise<ServerActionResult<TResult, TError>>) => {
  const execute =
    (index: number) =>
    async (ctx: Record<string, unknown>, rawInput: unknown): Promise<ServerActionResult<TResult, TError>> => {
      if (index >= entries.length) return toSuccessResult(await handler(ctx));

      const entry = entries[index];
      if (!entry) return toSuccessResult(await handler(ctx));

      if (Array.isArray(entry)) {
        return executeParallel(entry, ctx, rawInput, (nextCtx) => execute(index + 1)(nextCtx, rawInput));
      }

      return entry(ctx, rawInput, (nextCtx) => execute(index + 1)({ ...ctx, ...nextCtx }, rawInput)) as Promise<
        ServerActionResult<TResult, TError>
      >;
    };

  return execute(0);
};

type ActionBuilderOptions = {
  errorPrefix?: string;
};

const formatError =
  <TError>(options?: ActionBuilderOptions) =>
  (error: unknown): TError =>
    (options?.errorPrefix ? [options.errorPrefix, error].join('.') : error) as TError;

export const actionBuilder = (options?: ActionBuilderOptions): ActionBuilder<object> => {
  const createBuilder = <TCtx extends object>(entries: MiddlewareEntry[]): ActionBuilder<TCtx> =>
    ({
      use: (...middlewares: AnyPipeMiddleware[]) => {
        const [single] = middlewares;
        const entry: MiddlewareEntry = middlewares.length === 1 && single ? single : middlewares;
        return createBuilder([...entries, entry]);
      },

      execute: <TResult = undefined, TError extends string = string>(
        handler: (ctx: TCtx) => Promise<ServerActionResult<TResult, TError> | TResult | undefined>
      ) => {
        const pipeline = buildPipeline<TResult, TError>(
          entries,
          handler as (ctx: Record<string, unknown>) => Promise<ServerActionResult<TResult, TError> | TResult | undefined>
        );

        return async (rawInput?: unknown): Promise<ServerActionResult<TResult, TError>> => {
          try {
            return await pipeline({}, rawInput);
          } catch (error: unknown) {
            const { isRedirectError } = await import('./action-error');
            if (isRedirectError(error)) throw error;
            return { success: false, error: formatError<TError>(options)(error) };
          }
        };
      }
    }) as ActionBuilder<TCtx>;

  return createBuilder<object>([]);
};
