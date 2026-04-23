import { Either, type ParseResult, Schema } from 'effect';
import { notFound } from 'next/navigation';

type ErrorHandlers<E extends { _tag: string }> = {
  [K in E['_tag']]?: (error: Extract<E, { _tag: K }>) => never;
};

export const withDecode =
  <TKey extends string, TSchema extends Schema.Schema.AnyNoContext>(
    key: TKey,
    schema: TSchema,
    handlers: ErrorHandlers<ParseResult.ParseError> = {}
  ) =>
  async <TContext extends Record<TKey, Schema.Schema.Encoded<TSchema>>>(
    ctx: TContext,
    _props: unknown
  ): Promise<{ ctx: { [K in TKey]: Schema.Schema.Type<TSchema> } }> => {
    const result = Schema.decodeEither(schema)(ctx[key]);
    if (!Either.isLeft(result)) return { ctx: { [key]: result.right } as { [K in TKey]: Schema.Schema.Type<TSchema> } };
    const error = result.left;
    const handler = handlers[error._tag as keyof typeof handlers];
    return handler ? handler(error as Parameters<typeof handler>[0]) : notFound();
  };
