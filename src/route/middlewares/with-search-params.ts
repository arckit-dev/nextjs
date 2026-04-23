import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function withSearchParams<TSearchParams>(
  parse: (raw: Record<string, string>) => TSearchParams
): (ctx: object, request: NextRequest) => Promise<{ ctx: { searchParams: TSearchParams } } | NextResponse>;

export function withSearchParams<TSearchParams extends Record<string, string> = Record<string, string>>(): (
  ctx: object,
  request: NextRequest
) => Promise<{ ctx: { searchParams: TSearchParams } }>;

export function withSearchParams(parse?: (raw: Record<string, string>) => unknown) {
  return async (_ctx: object, request: NextRequest) => {
    const url = new URL(request.url);
    const rawParams = Object.fromEntries(url.searchParams.entries());
    if (!parse) return { ctx: { searchParams: rawParams } };
    try {
      return { ctx: { searchParams: parse(rawParams) } };
    } catch {
      return NextResponse.json({ error: 'Invalid search parameters' }, { status: 422 });
    }
  };
}
