import type { Counter, Gauge, Histogram, Measurement, Metrics, SpanAttributes } from '@arckit/telemetry';
import { describe, expect, it } from 'vitest';
import { withMetrics } from './with-metrics';

const ServerActionSuccess = <T = void>(data?: T) => ({ success: true as const, data });
const ServerActionError = <T extends string>(error: T) => ({ success: false as const, error });

const syncScheduler = (fn: () => void): void => fn();

const measurement = (instrumentName: string, value: number, attributes?: SpanAttributes): Measurement => ({
  instrumentName,
  value,
  attributes: attributes ?? {}
});

const captureCounter = (): { metrics: Metrics; observe: () => Promise<SpanAttributes> } => {
  const { resolve, promise } = Promise.withResolvers<SpanAttributes>();
  const metrics: Metrics = {
    counter: (name: string): Counter => ({
      add: (value: number, attributes?: SpanAttributes): Measurement => {
        resolve(attributes ?? {});
        return measurement(name, value, attributes);
      }
    }),
    histogram: (name: string): Histogram => ({
      record: (value: number, attributes?: SpanAttributes): Measurement => measurement(name, value, attributes)
    }),
    gauge: (name: string): Gauge => ({
      record: (value: number, attributes?: SpanAttributes): Measurement => measurement(name, value, attributes)
    })
  };
  return { metrics, observe: () => promise };
};

describe('withMetrics', () => {
  it('tags the counter with the action name and success status', async () => {
    const capture = captureCounter();
    const middleware = withMetrics(capture.metrics, syncScheduler)('createClient');

    await middleware({}, {}, async () => ServerActionSuccess());

    expect(await capture.observe()).toEqual({ action: 'createClient', status: 'success' });
  });

  it('tags the counter with the failure status when the action fails', async () => {
    const capture = captureCounter();
    const middleware = withMetrics(capture.metrics, syncScheduler)('createClient');

    await middleware({}, {}, async () => ServerActionError('AlreadyExists'));

    expect(await capture.observe()).toEqual({ action: 'createClient', status: 'failure' });
  });

  it('returns the action result unchanged', async () => {
    const capture = captureCounter();
    const middleware = withMetrics(capture.metrics, syncScheduler)('createClient');

    const result = await middleware({}, {}, async () => ServerActionSuccess({ id: 'c1' }));

    expect(result).toEqual({ success: true, data: { id: 'c1' } });
  });
});
