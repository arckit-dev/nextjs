import { NextResponse } from 'next/server';
import { describe, expect, it } from 'vitest';
import { withRequired } from './with-required';

describe('withRequired (route)', () => {
  it('passes through when every key is present', async () => {
    const result = await withRequired('lieu')({ lieu: { id: '1' } });

    expect(result).toEqual({ ctx: { lieu: { id: '1' } } });
  });

  it('returns a 404 response when a key is nullish', async () => {
    const result = await withRequired('lieu')({ lieu: null });

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(404);
  });
});
