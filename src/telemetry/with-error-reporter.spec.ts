import type { ErrorCapture, ErrorRecord, ErrorReporter } from '@arckit/telemetry';
import { describe, expect, it } from 'vitest';
import { withErrorReporter } from './with-error-reporter';

const syncScheduler = (fn: () => void): void => fn();

const captureFirst = (): { reporter: ErrorReporter; observe: () => Promise<ErrorCapture> } => {
  const { resolve, promise } = Promise.withResolvers<ErrorCapture>();
  return {
    reporter: {
      captureException: (capture: ErrorCapture): ErrorRecord => {
        resolve(capture);
        return {};
      },
      captureMessage: (): ErrorRecord => ({})
    },
    observe: () => promise
  };
};

describe('withErrorReporter', () => {
  it('re-throws the original error', async () => {
    const capture = captureFirst();
    const middleware = withErrorReporter(capture.reporter, syncScheduler)('user.create');
    const thrown = new Error('boom');

    await expect(middleware({}, {}, async () => Promise.reject(thrown))).rejects.toBe(thrown);
  });

  it('captures the thrown error', async () => {
    const capture = captureFirst();
    const middleware = withErrorReporter(capture.reporter, syncScheduler)('user.create');
    const thrown = new Error('boom');

    await middleware({}, {}, async () => Promise.reject(thrown)).catch(() => undefined);

    expect((await capture.observe()).error).toBe(thrown);
  });

  it('wraps non-Error thrown values into an Error', async () => {
    const capture = captureFirst();
    const middleware = withErrorReporter(capture.reporter, syncScheduler)('user.create');

    await middleware({}, {}, async () => Promise.reject('string error')).catch(() => undefined);

    expect((await capture.observe()).error.message).toBe('string error');
  });

  it('uses the error level by default', async () => {
    const capture = captureFirst();
    const middleware = withErrorReporter(capture.reporter, syncScheduler)('user.create');

    await middleware({}, {}, async () => Promise.reject(new Error('boom'))).catch(() => undefined);

    expect((await capture.observe()).level).toBe('error');
  });

  it('uses the configured level when specified', async () => {
    const capture = captureFirst();
    const middleware = withErrorReporter(capture.reporter, syncScheduler)('user.create', { level: 'fatal' });

    await middleware({}, {}, async () => Promise.reject(new Error('boom'))).catch(() => undefined);

    expect((await capture.observe()).level).toBe('fatal');
  });

  it('includes the event name in attributes', async () => {
    const capture = captureFirst();
    const middleware = withErrorReporter(capture.reporter, syncScheduler)('user.create');

    await middleware({}, {}, async () => Promise.reject(new Error('boom'))).catch(() => undefined);

    expect((await capture.observe()).attributes?.event).toBe('user.create');
  });

  it('includes attributes extracted from the context', async () => {
    const capture = captureFirst();
    type Ctx = { input: { name: string } };
    const middleware = withErrorReporter(capture.reporter, syncScheduler)<Ctx>('user.create', {
      extractAttributes: (ctx) => ({ name: ctx.input.name })
    });

    await middleware({ input: { name: 'Acme' } }, {}, async () => Promise.reject(new Error('boom'))).catch(() => undefined);

    expect((await capture.observe()).attributes?.name).toBe('Acme');
  });
});
