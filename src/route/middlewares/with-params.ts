import { NextResponse } from 'next/server';

type ExtractParams<TKeys extends string[]> = { [K in TKeys[number]]: string };

export const withParams =
  <TKeys extends string[]>(...keys: TKeys) =>
  async <TCtx extends { params: Record<string, string> }>(ctx: TCtx): Promise<{ ctx: ExtractParams<TKeys> } | NextResponse> => {
    const { params } = ctx;

    for (const key of keys) {
      if (params[key] === undefined) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return { ctx: Object.fromEntries(keys.map((key) => [key, params[key]])) as ExtractParams<TKeys> };
  };
