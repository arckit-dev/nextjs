import { Either } from 'effect';

export const withOptionalEither =
  <TKey extends string, TContext, TData>(key: TKey, fetcher: (ctx: TContext) => Promise<Either.Either<TData, unknown>>) =>
  async (ctx: TContext, _props: unknown): Promise<{ ctx: { [K in TKey]: TData | null } }> => {
    const result = await fetcher(ctx);
    return { ctx: { [key]: Either.isRight(result) ? result.right : null } as { [K in TKey]: TData | null } };
  };
