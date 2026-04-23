export const withMap =
  <TKey extends string, TContext extends object, TData>(key: TKey, mapper: (ctx: TContext) => TData) =>
  async (ctx: TContext, _extra: unknown): Promise<{ ctx: { [K in TKey]: TData } }> => ({
    ctx: { [key]: mapper(ctx) } as { [K in TKey]: TData }
  });
