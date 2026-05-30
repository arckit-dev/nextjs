import type { StandardSchemaV1 } from '@standard-schema/spec';
import { describe, expect, it } from 'vitest';
import { withInput } from './with-input';

const captureContext = async (ctx: Record<string, unknown>) => ({ success: true as const, data: ctx });

const numberFromString: StandardSchemaV1<{ value: string }, { value: number }> = {
  '~standard': {
    version: 1,
    vendor: 'test',
    validate: (input) => ({ value: { value: Number((input as { value: string }).value) } })
  }
};

describe('withInput', () => {
  it('forwards the input parsed by a plain validator function', async () => {
    const middleware = withInput((raw) => ({ value: Number((raw as { value: string }).value) }));

    const result = await middleware({}, { value: '42' }, captureContext);

    expect(result).toEqual({ success: true, data: { input: { value: 42 } } });
  });

  it('forwards the input decoded by a Standard Schema', async () => {
    const middleware = withInput(numberFromString);

    const result = await middleware({}, { value: '42' }, captureContext);

    expect(result).toEqual({ success: true, data: { input: { value: 42 } } });
  });
});
