import type { LogEntry, Logger, LogRecord } from '@arckit/telemetry';
import type { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { createWithLogger } from './with-logger';

const syncScheduler = (fn: () => void): void => fn();

const recordingLogger = (): { logger: Logger; entries: LogEntry[] } => {
  const entries: LogEntry[] = [];
  return {
    entries,
    logger: {
      log: (entry: LogEntry): LogRecord => {
        entries.push(entry);
        return {};
      }
    }
  };
};

const context = (method = 'GET', pathname = '/api/lieux'): { request: NextRequest } =>
  ({ request: { method, nextUrl: { pathname } } }) as unknown as { request: NextRequest };

describe('createWithLogger (route)', () => {
  it('returns the handler response unchanged', async () => {
    const { logger } = recordingLogger();
    const handle = createWithLogger(logger, syncScheduler)('lieux')(async () => new Response('ok', { status: 200 }));

    const response = await handle(context());

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('ok');
  });

  it('logs a success entry with request, status and duration', async () => {
    const { logger, entries } = recordingLogger();
    const handle = createWithLogger(logger, syncScheduler)('lieux')(async () => new Response(null, { status: 204 }));

    await handle(context('GET', '/api/lieux'));

    expect(entries[0]?.event).toBe('lieux:success');
    expect(entries[0]?.attributes?.method).toBe('GET');
    expect(entries[0]?.attributes?.path).toBe('/api/lieux');
    expect(entries[0]?.attributes?.status).toBe(204);
    expect(typeof entries[0]?.attributes?.durationMs).toBe('number');
  });

  it('logs a failure entry and rethrows when the handler throws', async () => {
    const { logger, entries } = recordingLogger();
    const thrown = new TypeError('boom');
    const handle = createWithLogger(logger, syncScheduler)('lieux')(async () => {
      throw thrown;
    });

    await expect(handle(context())).rejects.toBe(thrown);
    expect(entries[0]?.event).toBe('lieux:failure');
    expect(entries[0]?.attributes?.['error.type']).toBe('TypeError');
  });

  it('logs at the info level by default', async () => {
    const { logger, entries } = recordingLogger();
    const handle = createWithLogger(logger, syncScheduler)('lieux')(async () => new Response(null));

    await handle(context());

    expect(entries[0]?.level).toBe('info');
  });

  it('logs at the configured level', async () => {
    const { logger, entries } = recordingLogger();
    const handle = createWithLogger(logger, syncScheduler)('lieux', { level: 'debug' })(async () => new Response(null));

    await handle(context());

    expect(entries[0]?.level).toBe('debug');
  });

  it('includes attributes extracted from the context', async () => {
    const { logger, entries } = recordingLogger();
    type Ctx = { request: NextRequest; searchParams: { region: string } };
    const handle = createWithLogger(logger, syncScheduler)<Ctx>('lieux', {
      extractAttributes: (ctx) => ({ region: ctx.searchParams.region })
    })(async () => new Response(null));

    await handle({ ...context(), searchParams: { region: 'bretagne' } } as Ctx);

    expect(entries[0]?.attributes?.region).toBe('bretagne');
  });
});
