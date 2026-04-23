import type { ReactNode } from 'react';
import type { Pipeline, Provider } from '../shared/types';
import { applyProviders } from './apply-providers';

type AnyMiddleware<TExtra> = (
  ctx: Record<string, unknown>,
  extra: TExtra
) => Promise<{ ctx: Record<string, unknown>; provider?: Provider }>;

type MiddlewareEntry<TExtra> = AnyMiddleware<TExtra> | AnyMiddleware<TExtra>[];

type MiddlewareAccumulator = {
  ctx: Record<string, unknown>;
  providers: Provider[];
};

const executeParallel = async <TExtra>(
  middlewares: AnyMiddleware<TExtra>[],
  ctx: Record<string, unknown>,
  extra: TExtra
): Promise<MiddlewareAccumulator> => {
  const results = await Promise.all(middlewares.map((middleware) => middleware(ctx, extra)));
  return results.reduce<MiddlewareAccumulator>(
    (acc, result) => ({
      ctx: { ...acc.ctx, ...result.ctx },
      providers: result.provider ? [...acc.providers, result.provider] : acc.providers
    }),
    { ctx, providers: [] }
  );
};

const toResolvedMiddleware =
  <TExtra>(extra: TExtra) =>
  async (accPromise: Promise<MiddlewareAccumulator>, entry: MiddlewareEntry<TExtra>): Promise<MiddlewareAccumulator> => {
    const acc = await accPromise;
    if (Array.isArray(entry)) {
      const parallelResult = await executeParallel(entry, acc.ctx, extra);
      return {
        ctx: parallelResult.ctx,
        providers: [...acc.providers, ...parallelResult.providers]
      };
    }
    const result = await entry(acc.ctx, extra);
    return {
      ctx: { ...acc.ctx, ...result.ctx },
      providers: result.provider ? [...acc.providers, result.provider] : acc.providers
    };
  };

export const render =
  <TCtx extends object, TExtra, TFin extends string>(pipeline: Pipeline<TCtx, TExtra, TFin>) =>
  (handler: (ctx: TCtx, extra: TExtra) => Promise<ReactNode>): ((extra: TExtra) => Promise<ReactNode>) =>
  async (extra: TExtra) => {
    const { ctx, providers } = await (pipeline.middlewares as unknown as MiddlewareEntry<TExtra>[]).reduce(
      toResolvedMiddleware(extra),
      Promise.resolve<MiddlewareAccumulator>({ ctx: {}, providers: [] })
    );
    const content = await handler(ctx as TCtx, extra);
    return applyProviders(providers, content);
  };
