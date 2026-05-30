import { notFound } from 'next/navigation';
import { decode, type StandardSchemaV1 } from '../../standard-schema';

export const withDecode =
  <TKey extends string, Schema extends StandardSchemaV1>(key: TKey, schema: Schema, onInvalid: () => never = notFound) =>
  async <TContext extends Record<TKey, unknown>>(
    ctx: TContext,
    _props: unknown
  ): Promise<{ ctx: { [K in TKey]: StandardSchemaV1.InferOutput<Schema> } }> => {
    const result = decode(schema, ctx[key]);
    if (result.issues != null) return onInvalid();
    return { ctx: { [key]: result.value } as { [K in TKey]: StandardSchemaV1.InferOutput<Schema> } };
  };
