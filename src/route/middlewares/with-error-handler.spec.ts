import type { ErrorCapture, ErrorRecord, ErrorReporter } from '@arckit/telemetry';
import { describe, expect, it } from 'vitest';
import { createWithErrorHandler, withErrorHandler } from './with-error-handler';

const syncScheduler = (fn: () => void): void => fn();

const recordingReporter = (): { reporter: ErrorReporter; captures: ErrorCapture[] } => {
  const captures: ErrorCapture[] = [];
  return {
    captures,
    reporter: {
      captureException: (capture: ErrorCapture): ErrorRecord => {
        captures.push(capture);
        return {};
      },
      captureMessage: (): ErrorRecord => ({})
    }
  };
};

const responseError = (status: number): Error & { response: Response } =>
  Object.assign(new Error(`failed with ${status}`), { response: new Response(null, { status }) });

describe('withErrorHandler (route)', () => {
  it('returns the handler response when it succeeds', async () => {
    const handle = withErrorHandler({}, 'oops')(async () => new Response('ok', { status: 200 }));

    const response = await handle({});

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('ok');
  });

  it('maps a response error to its status with the mapped message', async () => {
    const handle = withErrorHandler(
      { 504: 'too long' },
      'oops'
    )(async () => {
      throw responseError(504);
    });

    const response = await handle({});

    expect(response.status).toBe(504);
    expect(await response.text()).toBe('too long');
  });

  it('falls back to a 500 with the default message for an unmapped error', async () => {
    const handle = withErrorHandler(
      {},
      'oops'
    )(async () => {
      throw new Error('boom');
    });

    const response = await handle({});

    expect(response.status).toBe(500);
    expect(await response.text()).toBe('oops');
  });
});

describe('createWithErrorHandler (route)', () => {
  it('produces the same response as withErrorHandler on failure', async () => {
    const { reporter } = recordingReporter();
    const handle = createWithErrorHandler(reporter, syncScheduler)({ 504: 'too long' }, 'oops')(async () => {
      throw responseError(504);
    });

    const response = await handle({});

    expect(response.status).toBe(504);
    expect(await response.text()).toBe('too long');
  });

  it('does not capture anything when the handler succeeds', async () => {
    const { reporter, captures } = recordingReporter();
    const handle = createWithErrorHandler(reporter, syncScheduler)({}, 'oops')(async () => new Response('ok'));

    await handle({});

    expect(captures).toHaveLength(0);
  });

  it('captures the thrown error', async () => {
    const { reporter, captures } = recordingReporter();
    const thrown = new Error('boom');
    const handle = createWithErrorHandler(reporter, syncScheduler)({}, 'oops')(async () => {
      throw thrown;
    });

    await handle({});

    expect(captures[0]?.error).toBe(thrown);
  });

  it('wraps a non-Error thrown value into an Error', async () => {
    const { reporter, captures } = recordingReporter();
    const handle = createWithErrorHandler(reporter, syncScheduler)({}, 'oops')(async () => {
      throw 'string error';
    });

    await handle({});

    expect(captures[0]?.error.message).toBe('string error');
  });

  it('captures with the error level by default', async () => {
    const { reporter, captures } = recordingReporter();
    const handle = createWithErrorHandler(reporter, syncScheduler)({}, 'oops')(async () => {
      throw new Error('boom');
    });

    await handle({});

    expect(captures[0]?.level).toBe('error');
  });

  it('captures with the configured level', async () => {
    const { reporter, captures } = recordingReporter();
    const handle = createWithErrorHandler(reporter, syncScheduler)({}, 'oops')(
      async () => {
        throw new Error('boom');
      },
      { level: 'fatal' }
    );

    await handle({});

    expect(captures[0]?.level).toBe('fatal');
  });

  it('includes attributes extracted from the context', async () => {
    const { reporter, captures } = recordingReporter();
    type Ctx = { searchParams: { region: string } };
    const handle = createWithErrorHandler(reporter, syncScheduler)({}, 'oops')<Ctx>(
      async () => {
        throw new Error('boom');
      },
      { extractAttributes: (ctx) => ({ region: ctx.searchParams.region }) }
    );

    await handle({ searchParams: { region: 'bretagne' } });

    expect(captures[0]?.attributes?.region).toBe('bretagne');
  });
});
