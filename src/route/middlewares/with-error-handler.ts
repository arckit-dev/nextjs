import type { ErrorAttributes, ErrorLevel, ErrorReporter } from '@arckit/telemetry';
import { preservingAfter } from '../../telemetry/preserving-after';
import type { Scheduler } from '../../telemetry/scheduler';

type ErrorMapping = { [statusCode: number]: string };

type ResponseError = Error & { response: Response };

const isResponseError = (error: unknown): error is ResponseError =>
  error instanceof Error && 'response' in error && error.response instanceof Response;

const toErrorResponse =
  (errorMapping: ErrorMapping, defaultMessage: string) =>
  (error: unknown): Response => {
    if (isResponseError(error)) {
      const message = errorMapping[error.response.status] ?? defaultMessage;
      return new Response(message, { status: error.response.status });
    }
    return new Response(defaultMessage, { status: 500 });
  };

export const withErrorHandler =
  (errorMapping: ErrorMapping, defaultMessage: string) =>
  <TCtx extends object>(handler: (ctx: TCtx) => Promise<Response>) =>
  async (ctx: TCtx): Promise<Response> => {
    try {
      return await handler(ctx);
    } catch (error) {
      return toErrorResponse(errorMapping, defaultMessage)(error);
    }
  };

type AttributesExtractor<TCtx> = (ctx: TCtx) => ErrorAttributes;

type ReportedErrorHandlerOptions<TCtx> = {
  readonly level?: ErrorLevel;
  readonly extractAttributes?: AttributesExtractor<TCtx>;
};

const toError = (caught: unknown): Error => (caught instanceof Error ? caught : new Error(String(caught)));

export const createWithErrorHandler =
  (reporter: ErrorReporter, schedule: Scheduler = preservingAfter) =>
  (errorMapping: ErrorMapping, defaultMessage: string) =>
  <TCtx extends object>(
    handler: (ctx: TCtx) => Promise<Response>,
    { level = 'error', extractAttributes }: ReportedErrorHandlerOptions<TCtx> = {}
  ) =>
  async (ctx: TCtx): Promise<Response> => {
    try {
      return await handler(ctx);
    } catch (error) {
      schedule(() => {
        reporter.captureException({
          error: toError(error),
          level,
          ...(extractAttributes ? { attributes: extractAttributes(ctx) } : {})
        });
      });
      return toErrorResponse(errorMapping, defaultMessage)(error);
    }
  };
