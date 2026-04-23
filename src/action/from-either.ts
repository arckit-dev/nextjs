import { Either } from 'effect';
import { ServerActionError, type ServerActionResult, ServerActionSuccess } from './result';

type ErrorMap<TError extends { _tag: string }> = { [K in TError['_tag']]: string };

type ExtractErrorValues<TMap extends Record<string, string>> = TMap[keyof TMap];

type FromEitherOptions<TResult, TError extends { _tag: string }, TErrorMap extends ErrorMap<TError>> = {
  onError: TErrorMap;
  onSuccess?: (result: TResult) => void;
};

export const fromEither =
  <TCtx, TResult, TError extends { _tag: string }, const TErrorMap extends ErrorMap<TError>>(
    handler: (ctx: TCtx) => Promise<Either.Either<TResult, TError>>,
    options: FromEitherOptions<TResult, TError, TErrorMap>
  ): ((ctx: TCtx) => Promise<ServerActionResult<TResult, ExtractErrorValues<TErrorMap>>>) =>
  async (ctx: TCtx): Promise<ServerActionResult<TResult, ExtractErrorValues<TErrorMap>>> => {
    const result = await handler(ctx);

    if (Either.isLeft(result)) {
      const tag = result.left._tag;
      return ServerActionError(options.onError[tag as keyof TErrorMap]) as ServerActionResult<
        TResult,
        ExtractErrorValues<TErrorMap>
      >;
    }

    options.onSuccess?.(result.right);
    return ServerActionSuccess(result.right);
  };
