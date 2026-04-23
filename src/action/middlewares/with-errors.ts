import type { PipeMiddleware } from '../action-builder';
import type { ServerActionResult } from '../result';

export const withErrors =
  (mapping: Record<string, string>): PipeMiddleware<object, { _errorMapping: Record<string, string> }, unknown> =>
  async (_ctx, _rawInput, next): Promise<ServerActionResult<unknown>> =>
    next({ _errorMapping: mapping });
