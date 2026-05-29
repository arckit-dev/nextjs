import { NextResponse } from 'next/server';
import { describe, expect, it } from 'vitest';
import { withParams } from './with-params';

describe('withParams (route)', () => {
  it('extracts the requested keys from params into the context', async () => {
    const result = await withParams('id')({ params: { id: '42' } });

    expect(result).toEqual({ ctx: { id: '42' } });
  });

  it('extracts several keys at once', async () => {
    const result = await withParams(
      'region',
      'departement'
    )({
      params: { region: 'bretagne', departement: '29', extra: 'ignored' }
    });

    expect(result).toEqual({ ctx: { region: 'bretagne', departement: '29' } });
  });

  it('returns a 404 response when a requested key is missing', async () => {
    const result = await withParams('id')({ params: {} });

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(404);
  });
});
