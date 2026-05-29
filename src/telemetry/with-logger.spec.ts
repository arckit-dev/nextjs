import type { LogEntry, Logger, LogRecord } from '@arckit/telemetry';
import { describe, expect, it } from 'vitest';
import { withLogger } from './with-logger';

const ServerActionSuccess = <T = void>(data?: T) => ({ success: true as const, data });
const ServerActionError = <T extends string>(error: T) => ({ success: false as const, error });

const syncScheduler = (fn: () => void): void => fn();

const captureFirst = (): { logger: Logger; observe: () => Promise<LogEntry> } => {
  const { resolve, promise } = Promise.withResolvers<LogEntry>();
  return {
    logger: {
      log: (entry: LogEntry): LogRecord => {
        resolve(entry);
        return {};
      }
    },
    observe: () => promise
  };
};

describe('withLogger', () => {
  it('emits a success event when the action returns a success result', async () => {
    const capture = captureFirst();
    const middleware = withLogger(capture.logger, syncScheduler)('user.create');

    await middleware({}, {}, async () => ServerActionSuccess({ id: 'u1' }));

    expect((await capture.observe()).event).toBe('user.create:success');
  });

  it('emits a failure event when the action returns an error result', async () => {
    const capture = captureFirst();
    const middleware = withLogger(capture.logger, syncScheduler)('user.create');

    await middleware({}, {}, async () => ServerActionError('AlreadyExists'));

    expect((await capture.observe()).event).toBe('user.create:failure');
  });

  it('carries the error.type attribute on failure', async () => {
    const capture = captureFirst();
    const middleware = withLogger(capture.logger, syncScheduler)('user.create');

    await middleware({}, {}, async () => ServerActionError('AlreadyExists'));

    expect((await capture.observe()).attributes).toEqual({ 'error.type': 'AlreadyExists' });
  });

  it('uses the configured level on success', async () => {
    const capture = captureFirst();
    const middleware = withLogger(capture.logger, syncScheduler)('audit.read', { level: 'debug' });

    await middleware({}, {}, async () => ServerActionSuccess());

    expect((await capture.observe()).level).toBe('debug');
  });

  it('includes attributes extracted from the action context', async () => {
    const capture = captureFirst();
    type Ctx = { input: { name: string } };
    const middleware = withLogger(capture.logger, syncScheduler)<Ctx>('user.create', {
      extractAttributes: (ctx) => ({ name: ctx.input.name })
    });

    await middleware({ input: { name: 'Acme' } }, {}, async () => ServerActionSuccess());

    expect((await capture.observe()).attributes).toEqual({ name: 'Acme' });
  });

  it('returns the action result unchanged', async () => {
    const capture = captureFirst();
    const middleware = withLogger(capture.logger, syncScheduler)('user.create');

    const result = await middleware({}, {}, async () => ServerActionSuccess({ id: 'u1' }));

    expect(result).toEqual({ success: true, data: { id: 'u1' } });
  });
});
