import type { InjectionKey } from 'piqure/src/Providing';
import type { ReactNode } from 'react';
import { ERROR_PREFIX_KEY } from '../action/technical-error-formatter';
import type { Pipeline } from '../shared/types';
import { render } from './page-execution';
import type { PageProps } from './types';

type AnyMiddleware = (ctx: Record<string, unknown>, extra: PageProps) => Promise<{ ctx: Record<string, unknown> }>;

type TypedMiddleware<TCtxIn extends object, TCtxOut extends object> = (
  ctx: TCtxIn,
  extra: PageProps
) => Promise<{ ctx: TCtxOut }>;

type Merge<A extends object, B extends object> = Omit<A, keyof B> & B;

type MiddlewareEntry = AnyMiddleware | AnyMiddleware[];

export interface PageBuilder<TCtx extends object> {
  use<O1 extends object>(m1: TypedMiddleware<TCtx, O1>): PageBuilder<Merge<TCtx, O1>>;

  use<O1 extends object, O2 extends object>(
    m1: TypedMiddleware<TCtx, O1>,
    m2: TypedMiddleware<TCtx, O2>
  ): PageBuilder<Merge<Merge<TCtx, O1>, O2>>;

  use<O1 extends object, O2 extends object, O3 extends object>(
    m1: TypedMiddleware<TCtx, O1>,
    m2: TypedMiddleware<TCtx, O2>,
    m3: TypedMiddleware<TCtx, O3>
  ): PageBuilder<Merge<Merge<Merge<TCtx, O1>, O2>, O3>>;

  use<O1 extends object, O2 extends object, O3 extends object, O4 extends object>(
    m1: TypedMiddleware<TCtx, O1>,
    m2: TypedMiddleware<TCtx, O2>,
    m3: TypedMiddleware<TCtx, O3>,
    m4: TypedMiddleware<TCtx, O4>
  ): PageBuilder<Merge<Merge<Merge<Merge<TCtx, O1>, O2>, O3>, O4>>;

  render(handler: (ctx: TCtx, props: PageProps) => Promise<ReactNode>): (props: PageProps) => Promise<ReactNode>;
}

type PageBuilderOptions = {
  errorPrefix?: string;
};

type WithClientBinder = <TBind, TTo extends TBind>(bind: InjectionKey<TBind>, to: TTo) => AnyMiddleware;

export const createPageBuilder =
  (withClientBinder: WithClientBinder) =>
  (options?: PageBuilderOptions): PageBuilder<object> => {
    const createBuilder = <TCtx extends object>(entries: MiddlewareEntry[]): PageBuilder<TCtx> =>
      ({
        use: (...middlewares: AnyMiddleware[]) => {
          const [single] = middlewares;
          const entry: MiddlewareEntry = middlewares.length === 1 && single ? single : middlewares;
          return createBuilder([...entries, entry]);
        },

        render: (handler) => {
          const pipeline: Pipeline<TCtx, PageProps, 'page'> = {
            _ctx: {} as TCtx,
            _extra: {} as PageProps,
            _finalizer: 'page',
            middlewares: entries
          };
          return render(pipeline)(handler);
        }
      }) as PageBuilder<TCtx>;

    return createBuilder<object>([withClientBinder(ERROR_PREFIX_KEY, options?.errorPrefix) as unknown as AnyMiddleware]);
  };
