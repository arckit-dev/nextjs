export type Pipeline<TCtx extends object, TExtra, TFinalizer extends string> = {
  readonly _ctx: TCtx;
  readonly _extra: TExtra;
  readonly _finalizer: TFinalizer;
  readonly middlewares: unknown[];
};
