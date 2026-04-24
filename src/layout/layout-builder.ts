import type { ReactNode } from 'react';
import { render } from '../page/page-execution';
import type { Pipeline } from '../types';
import type { LayoutProps } from './types';

type AnyMiddleware = (ctx: Record<string, unknown>, extra: LayoutProps) => Promise<{ ctx: Record<string, unknown> }>;

type TypedMiddleware<TCtxIn extends object, TCtxOut extends object> = (
  ctx: TCtxIn,
  extra: LayoutProps
) => Promise<{ ctx: TCtxOut }>;

type Merge<A extends object, B extends object> = Omit<A, keyof B> & B;

type MiddlewareEntry = AnyMiddleware | AnyMiddleware[];

interface LayoutBuilder<TCtx extends object> {
  use<O1 extends object>(m1: TypedMiddleware<TCtx, O1>): LayoutBuilder<Merge<TCtx, O1>>;

  use<O1 extends object, O2 extends object>(
    m1: TypedMiddleware<TCtx, O1>,
    m2: TypedMiddleware<TCtx, O2>
  ): LayoutBuilder<Merge<Merge<TCtx, O1>, O2>>;

  use<O1 extends object, O2 extends object, O3 extends object>(
    m1: TypedMiddleware<TCtx, O1>,
    m2: TypedMiddleware<TCtx, O2>,
    m3: TypedMiddleware<TCtx, O3>
  ): LayoutBuilder<Merge<Merge<Merge<TCtx, O1>, O2>, O3>>;

  use<O1 extends object, O2 extends object, O3 extends object, O4 extends object>(
    m1: TypedMiddleware<TCtx, O1>,
    m2: TypedMiddleware<TCtx, O2>,
    m3: TypedMiddleware<TCtx, O3>,
    m4: TypedMiddleware<TCtx, O4>
  ): LayoutBuilder<Merge<Merge<Merge<Merge<TCtx, O1>, O2>, O3>, O4>>;

  render(handler: (ctx: TCtx, props: LayoutProps) => Promise<ReactNode>): (props: LayoutProps) => Promise<ReactNode>;
}

export const layoutBuilder = (): LayoutBuilder<object> => {
  const createBuilder = <TCtx extends object>(entries: MiddlewareEntry[]): LayoutBuilder<TCtx> =>
    ({
      use: (...middlewares: AnyMiddleware[]) => {
        const [single] = middlewares;
        const entry: MiddlewareEntry = middlewares.length === 1 && single ? single : middlewares;
        return createBuilder([...entries, entry]);
      },

      render: (handler) => {
        const pipeline: Pipeline<TCtx, LayoutProps, 'layout'> = {
          _ctx: {} as TCtx,
          _extra: {} as LayoutProps,
          _finalizer: 'layout',
          middlewares: entries
        };
        return render(pipeline)(handler);
      }
    }) as LayoutBuilder<TCtx>;

  return createBuilder<object>([]);
};
