export const withFetch =
  <TKey extends string, TContext extends object, TData>(key: TKey, fetcher: (ctx: TContext) => Promise<TData>) =>
  async (ctx: TContext, _extra: unknown): Promise<{ ctx: { [K in TKey]: TData } }> => ({
    ctx: { [key]: await fetcher(ctx) } as { [K in TKey]: TData }
  });
