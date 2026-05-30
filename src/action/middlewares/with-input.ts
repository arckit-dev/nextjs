import { decodeSync, isStandardSchema, type StandardSchemaV1 } from '../../standard-schema';
import type { PipeMiddleware } from '../action-builder';
import type { ServerActionResult } from '../result';

type Validator<TInput> = (rawInput: unknown) => TInput;

export function withInput<Schema extends StandardSchemaV1>(
  schema: Schema
): PipeMiddleware<object, { input: StandardSchemaV1.InferOutput<Schema> }, unknown>;
export function withInput<TInput>(validate: Validator<TInput>): PipeMiddleware<object, { input: TInput }, unknown>;
export function withInput(
  schemaOrValidate: StandardSchemaV1 | Validator<unknown>
): PipeMiddleware<object, { input: unknown }, unknown> {
  const validate: Validator<unknown> = isStandardSchema(schemaOrValidate)
    ? (rawInput) => decodeSync(schemaOrValidate, rawInput)
    : schemaOrValidate;

  return async (_ctx, rawInput, next): Promise<ServerActionResult<unknown>> => next({ input: validate(rawInput) });
}
