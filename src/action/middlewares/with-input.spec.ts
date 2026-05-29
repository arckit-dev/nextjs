import { Schema } from 'effect';
import { describe, expect, it } from 'vitest';
import { withInput } from './with-input';

const captureContext = async (ctx: Record<string, unknown>) => ({ success: true as const, data: ctx });

describe('withInput', () => {
  it('forwards the input parsed by a plain validator function', async () => {
    const middleware = withInput((raw) => ({ value: Number((raw as { value: string }).value) }));

    const result = await middleware({}, { value: '42' }, captureContext);

    expect(result).toEqual({ success: true, data: { input: { value: 42 } } });
  });

  it('forwards the input decoded by an effect schema', async () => {
    const middleware = withInput(Schema.Struct({ name: Schema.String }));

    const result = await middleware({}, { name: 'lieu' }, captureContext);

    expect(result).toEqual({ success: true, data: { input: { name: 'lieu' } } });
  });
});
