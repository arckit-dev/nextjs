export type PageProps<
  TParams extends Record<string, string> = Record<string, string>,
  TSearchParams extends Record<string, string | string[] | undefined> = Record<string, string | string[] | undefined>
> = {
  params: Promise<TParams>;
  searchParams: Promise<TSearchParams>;
};

export type TypedMiddleware<TCtxIn extends object, TCtxOut extends object, TProps extends PageProps> = (
  ctx: TCtxIn,
  props: TProps
) => Promise<{ ctx: TCtxOut }>;
