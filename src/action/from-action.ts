import type { Pipeline } from '../shared/types';

type AnyMiddleware = (ctx: Record<string, unknown>, rawInput: unknown) => Promise<{ ctx: Record<string, unknown> }>;

type TypedMiddleware<TCtxIn extends object, TCtxOut extends object> = (
  ctx: TCtxIn,
  rawInput: unknown
) => Promise<{ ctx: TCtxOut }>;

type Merge<A extends object, B extends object> = Omit<A, keyof B> & B;

type Use<TCtxIn extends object> = {
  <O1 extends object>(m1: TypedMiddleware<TCtxIn, O1>): Pipeline<Merge<TCtxIn, O1>, unknown, 'action'>;

  <O1 extends object, O2 extends object>(
    m1: TypedMiddleware<TCtxIn, O1>,
    m2: TypedMiddleware<TCtxIn, O2>
  ): Pipeline<Merge<Merge<TCtxIn, O1>, O2>, unknown, 'action'>;

  <O1 extends object, O2 extends object, O3 extends object>(
    m1: TypedMiddleware<TCtxIn, O1>,
    m2: TypedMiddleware<TCtxIn, O2>,
    m3: TypedMiddleware<TCtxIn, O3>
  ): Pipeline<Merge<Merge<Merge<TCtxIn, O1>, O2>, O3>, unknown, 'action'>;

  <O1 extends object, O2 extends object, O3 extends object, O4 extends object>(
    m1: TypedMiddleware<TCtxIn, O1>,
    m2: TypedMiddleware<TCtxIn, O2>,
    m3: TypedMiddleware<TCtxIn, O3>,
    m4: TypedMiddleware<TCtxIn, O4>
  ): Pipeline<Merge<Merge<Merge<Merge<TCtxIn, O1>, O2>, O3>, O4>, unknown, 'action'>;
};

export const fromAction: Pipeline<object, unknown, 'action'> = {
  _ctx: {} as object,
  _extra: {} as unknown,
  _finalizer: 'action',
  middlewares: []
};

export const use = <TCtxIn extends object>(pipeline: Pipeline<TCtxIn, unknown, 'action'>): Use<TCtxIn> =>
  ((...middlewares: TypedMiddleware<TCtxIn, object>[]) => ({
    ...pipeline,
    middlewares: [...pipeline.middlewares, middlewares as AnyMiddleware[]]
  })) as Use<TCtxIn>;
