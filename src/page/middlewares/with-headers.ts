import { headers } from 'next/headers';

export const withHeaders = async (_ctx: object, _props: unknown): Promise<{ ctx: { headers: Headers } }> => ({
  ctx: { headers: await headers() }
});
