import { Either } from 'effect';
import { notFound } from 'next/navigation';

type ErrorHandlers<E extends { _tag: string }> = {
  [K in E['_tag']]?: (error: Extract<E, { _tag: K }>) => never;
};

export const withEither =
  <TKey extends string, TContext, TError extends { _tag: string }, TData>(
    key: TKey,
    fetcher: (ctx: TContext) => Promise<Either.Either<TData, TError>>,
    handlers: ErrorHandlers<TError> = {}
  ) =>
  async (ctx: TContext, _props: unknown): Promise<{ ctx: { [K in TKey]: TData } }> => {
    const result = await fetcher(ctx);
    if (!Either.isLeft(result)) return { ctx: { [key]: result.right } as { [K in TKey]: TData } };
    const error = result.left;
    const handler = handlers[error._tag as keyof typeof handlers];
    return handler ? handler(error as Parameters<typeof handler>[0]) : notFound();
  };
