import { Schema } from 'effect';
import type { PipeMiddleware } from '../action-builder';
import type { ServerActionResult } from '../result';

type Validator<TInput> = (rawInput: unknown) => TInput;

export function withInput<S extends Schema.Schema.AnyNoContext>(
  schema: S
): PipeMiddleware<object, { input: Schema.Schema.Type<S> }, unknown>;
export function withInput<TInput>(validate: Validator<TInput>): PipeMiddleware<object, { input: TInput }, unknown>;
export function withInput(
  schemaOrValidate: Schema.Schema.AnyNoContext | Validator<unknown>
): PipeMiddleware<object, { input: unknown }, unknown> {
  const validate: Validator<unknown> = Schema.isSchema(schemaOrValidate)
    ? Schema.decodeUnknownSync(schemaOrValidate)
    : (schemaOrValidate as Validator<unknown>);

  return async (_ctx, rawInput, next): Promise<ServerActionResult<unknown>> => next({ input: validate(rawInput) });
}
