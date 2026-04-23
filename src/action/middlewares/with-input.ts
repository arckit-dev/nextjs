import { Schema } from 'effect';
import type { PipeMiddleware } from '../action-builder';
import type { ServerActionResult } from '../result';

export const withInput =
  <S extends Schema.Schema.AnyNoContext>(schema: S): PipeMiddleware<object, { input: Schema.Schema.Type<S> }, unknown> =>
  async (_ctx, rawInput, next): Promise<ServerActionResult<unknown>> =>
    next({ input: Schema.decodeUnknownSync(schema)(rawInput) });
