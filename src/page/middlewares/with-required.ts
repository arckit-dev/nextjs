import { notFound, redirect } from 'next/navigation';

type RequiredKeys<TContext, TKeys extends keyof TContext> = {
  [K in TKeys]: NonNullable<TContext[K]>;
};

export const withRequired =
  <TKeys extends string>(...keys: [...TKeys[], string] | TKeys[]) =>
  async <TContext extends Partial<Record<TKeys, unknown>>>(
    ctx: TContext,
    _props: unknown
  ): Promise<{ ctx: RequiredKeys<TContext, TKeys & keyof TContext> }> => {
    const allArgs = keys as string[];
    const lastArg = allArgs[allArgs.length - 1];
    const hasRedirect = lastArg?.startsWith('/');
    const keysToCheck = hasRedirect ? allArgs.slice(0, -1) : allArgs;
    const redirectUrl = hasRedirect ? lastArg : undefined;

    for (const key of keysToCheck) {
      if ((ctx as Record<string, unknown>)[key] == null) {
        if (redirectUrl) redirect(redirectUrl);
        notFound();
      }
    }

    return { ctx: ctx as unknown as RequiredKeys<TContext, TKeys & keyof TContext> };
  };
