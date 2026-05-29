import { describe, expect, it } from 'vitest';
import { withFetch } from './with-fetch';

describe('withFetch', () => {
  it('stores the fetched value under the given key', async () => {
    const result = await withFetch('lieu', async (ctx: { id: string }) => ({ id: ctx.id }))({ id: '42' }, undefined);

    expect(result).toEqual({ ctx: { lieu: { id: '42' } } });
  });

  it('passes the context to the fetcher', async () => {
    const result = await withFetch('doubled', async (ctx: { value: number }) => ctx.value * 2)({ value: 21 }, undefined);

    expect(result).toEqual({ ctx: { doubled: 42 } });
  });
});
