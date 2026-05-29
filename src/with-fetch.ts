import { cached } from './cached';

type CacheOptions<TContext> = {
  cacheKey: (ctx: TContext) => unknown[];
  revalidate: number | false;
  tags?: string[];
};

/* v8 ignore start -- delegates to next/cache unstable_cache, which requires a Next runtime (not exercised in unit tests) */
const withCache = async (
  cache: { cacheKey: (ctx: unknown) => unknown[]; revalidate: number | false; tags?: string[] },
  ctx: Record<string, unknown>,
  // biome-ignore lint/complexity/noBannedTypes: implementation signature needs a generic callable
  fetcher: Function,
  key: string
) => {
  const cachedFetcher = cached(
    () => fetcher(ctx),
    cache.cacheKey(ctx).map((part) => (typeof part === 'string' ? part : JSON.stringify(part))),
    { revalidate: cache.revalidate, ...(cache.tags ? { tags: cache.tags } : {}) }
  );
  return { ctx: { [key]: await cachedFetcher() } };
};
/* v8 ignore stop */

export function withFetch<TKey extends string, TContext, TData>(
  key: TKey,
  fetcher: (ctx: TContext) => Promise<TData>,
  options?: { cache?: CacheOptions<TContext> }
): (ctx: TContext, extra: unknown) => Promise<{ ctx: { [K in TKey]: TData } }>;

export function withFetch(
  key: string,
  // biome-ignore lint/complexity/noBannedTypes: implementation signature needs a generic callable
  fetcher: Function,
  options?: { cache?: { cacheKey: (ctx: unknown) => unknown[]; revalidate: number | false; tags?: string[] } }
) {
  return async (ctx: Record<string, unknown>, _extra: unknown) => {
    /* v8 ignore next 3 -- cache branch delegates to unstable_cache (Next runtime only) */
    if (options?.cache) {
      return withCache(options.cache, ctx, fetcher, key);
    }
    return { ctx: { [key]: await fetcher(ctx) } };
  };
}
