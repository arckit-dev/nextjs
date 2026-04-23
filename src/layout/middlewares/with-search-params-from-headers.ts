import { headers } from 'next/headers';

export const withSearchParamsFromHeaders =
  <TSearchParams>(parse: (raw: Record<string, string>) => TSearchParams) =>
  async (): Promise<{ ctx: { searchParams: TSearchParams } }> => {
    const requestHeaders = await headers();
    const currentUrl = requestHeaders.get('x-url');
    const rawSearchParams = currentUrl ? Object.fromEntries(new URL(currentUrl).searchParams) : {};
    return { ctx: { searchParams: parse(rawSearchParams) } };
  };
