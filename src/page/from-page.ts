import type { Pipeline } from '../types';
import type { PageProps } from './types';

type AnyMiddleware<TExtra> = (ctx: Record<string, unknown>, extra: TExtra) => Promise<{ ctx: Record<string, unknown> }>;

type TypedMiddleware<TCtxIn extends object, TCtxOut extends object, TExtra> = (
  ctx: TCtxIn,
  extra: TExtra
) => Promise<{ ctx: TCtxOut }>;

type Merge<A extends object, B extends object> = Omit<A, keyof B> & B;

type Use<TCtxIn extends object, TExtra, TFin extends string> = {
  <O1 extends object>(m1: TypedMiddleware<TCtxIn, O1, TExtra>): Pipeline<Merge<TCtxIn, O1>, TExtra, TFin>;

  <O1 extends object, O2 extends object>(
    m1: TypedMiddleware<TCtxIn, O1, TExtra>,
    m2: TypedMiddleware<TCtxIn, O2, TExtra>
  ): Pipeline<Merge<Merge<TCtxIn, O1>, O2>, TExtra, TFin>;

  <O1 extends object, O2 extends object, O3 extends object>(
    m1: TypedMiddleware<TCtxIn, O1, TExtra>,
    m2: TypedMiddleware<TCtxIn, O2, TExtra>,
    m3: TypedMiddleware<TCtxIn, O3, TExtra>
  ): Pipeline<Merge<Merge<Merge<TCtxIn, O1>, O2>, O3>, TExtra, TFin>;

  <O1 extends object, O2 extends object, O3 extends object, O4 extends object>(
    m1: TypedMiddleware<TCtxIn, O1, TExtra>,
    m2: TypedMiddleware<TCtxIn, O2, TExtra>,
    m3: TypedMiddleware<TCtxIn, O3, TExtra>,
    m4: TypedMiddleware<TCtxIn, O4, TExtra>
  ): Pipeline<Merge<Merge<Merge<Merge<TCtxIn, O1>, O2>, O3>, O4>, TExtra, TFin>;
};

export const fromPage: Pipeline<object, PageProps, 'page'> = {
  _ctx: {} as object,
  _extra: {} as PageProps,
  _finalizer: 'page',
  middlewares: []
};

export const use = <TCtxIn extends object, TExtra, TFin extends string>(
  pipeline: Pipeline<TCtxIn, TExtra, TFin>
): Use<TCtxIn, TExtra, TFin> =>
  ((...middlewares: TypedMiddleware<TCtxIn, object, TExtra>[]) => ({
    ...pipeline,
    middlewares: [...pipeline.middlewares, middlewares as AnyMiddleware<TExtra>[]]
  })) as Use<TCtxIn, TExtra, TFin>;
