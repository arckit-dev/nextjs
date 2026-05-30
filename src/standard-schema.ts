import type { StandardSchemaV1 } from '@standard-schema/spec';

export type { StandardSchemaV1 };

export const isStandardSchema = (value: unknown): value is StandardSchemaV1 =>
  typeof value === 'object' && value !== null && '~standard' in value;

const ensureSync = <Output>(
  result: StandardSchemaV1.Result<Output> | Promise<StandardSchemaV1.Result<Output>>
): StandardSchemaV1.Result<Output> => {
  if (result instanceof Promise) throw new TypeError('Standard Schema async validation is not supported here');
  return result;
};

export const decode = <Schema extends StandardSchemaV1>(
  schema: Schema,
  value: unknown
): StandardSchemaV1.Result<StandardSchemaV1.InferOutput<Schema>> => ensureSync(schema['~standard'].validate(value));

export const decodeSync = <Schema extends StandardSchemaV1>(
  schema: Schema,
  value: unknown
): StandardSchemaV1.InferOutput<Schema> => {
  const result = decode(schema, value);
  if (result.issues != null) throw new Error(result.issues.map((issue) => issue.message).join(', '));
  return result.value;
};
