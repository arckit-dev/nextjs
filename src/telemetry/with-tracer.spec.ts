import type { Span, StartSpanOptions, Tracer } from '@arckit/telemetry';
import { describe, expect, it } from 'vitest';
import { withTracer } from './with-tracer';

const ServerActionSuccess = <T = void>(data?: T) => ({ success: true as const, data });
const ServerActionError = <T extends string>(error: T) => ({ success: false as const, error });

const noopSpan: Span = {
  setAttribute: () => undefined,
  recordException: () => undefined,
  setStatus: () => undefined,
  end: () => undefined
};

const captureFirst = (): {
  tracer: Tracer;
  observe: () => Promise<{ name: string; options?: StartSpanOptions }>;
} => {
  const { resolve, promise } = Promise.withResolvers<{ name: string; options?: StartSpanOptions }>();
  return {
    tracer: {
      startSpan: async <T>(name: string, fn: (span: Span) => T | Promise<T>, options?: StartSpanOptions): Promise<T> => {
        resolve({ name, ...(options ? { options } : {}) });
        return fn(noopSpan);
      }
    },
    observe: () => promise
  };
};

describe('withTracer', () => {
  it('calls startSpan with the configured name', async () => {
    const capture = captureFirst();
    const middleware = withTracer(capture.tracer)('order.create');

    await middleware({}, {}, async () => ServerActionSuccess());

    expect((await capture.observe()).name).toBe('order.create');
  });

  it('passes options through to startSpan', async () => {
    const capture = captureFirst();
    const middleware = withTracer(capture.tracer)('order.create', {
      kind: 'server',
      attributes: { 'order.id': 'o1' }
    });

    await middleware({}, {}, async () => ServerActionSuccess());

    expect((await capture.observe()).options).toEqual({ kind: 'server', attributes: { 'order.id': 'o1' } });
  });

  it('returns the success result unchanged', async () => {
    const capture = captureFirst();
    const middleware = withTracer(capture.tracer)('order.create');

    const result = await middleware({}, {}, async () => ServerActionSuccess({ id: 'o1' }));

    expect(result).toEqual({ success: true, data: { id: 'o1' } });
  });

  it('returns the failure result unchanged', async () => {
    const capture = captureFirst();
    const middleware = withTracer(capture.tracer)('order.create');

    const result = await middleware({}, {}, async () => ServerActionError('NotEnoughStock'));

    expect(result).toEqual({ success: false, error: 'NotEnoughStock' });
  });
});
