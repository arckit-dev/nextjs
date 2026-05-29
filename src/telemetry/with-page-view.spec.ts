import type { EventRecord, EventTracker, IdentifyEvent, PageEvent, TrackedEvent } from '@arckit/telemetry';
import { describe, expect, it } from 'vitest';
import type { PageProps } from '../page/types';
import { withPageView } from './with-page-view';

const syncScheduler = (fn: () => void): void => fn();

const emptyProps: PageProps = { params: Promise.resolve({}), searchParams: Promise.resolve({}) };

const capturePage = (): { tracker: EventTracker; observe: () => Promise<PageEvent> } => {
  const { resolve, promise } = Promise.withResolvers<PageEvent>();
  return {
    tracker: {
      track: (_: TrackedEvent): EventRecord => ({}),
      identify: (_: IdentifyEvent): EventRecord => ({}),
      page: (event: PageEvent): EventRecord => {
        resolve(event);
        return {};
      }
    },
    observe: () => promise
  };
};

describe('withPageView', () => {
  it('fires page with the configured name', async () => {
    const capture = capturePage();
    const middleware = withPageView(capture.tracker, syncScheduler)('Clients List');

    await middleware({}, emptyProps);

    expect((await capture.observe()).name).toBe('Clients List');
  });

  it('passes properties extracted from the page context', async () => {
    const capture = capturePage();
    type Ctx = { page: number };
    const middleware = withPageView(capture.tracker, syncScheduler)<Ctx>('Clients List', (ctx) => ({ page: ctx.page }));

    await middleware({ page: 2 }, emptyProps);

    expect((await capture.observe()).properties).toEqual({ page: 2 });
  });

  it('returns the context unchanged so the pipeline continues', async () => {
    const capture = capturePage();
    const ctx = { page: 1 };
    const middleware = withPageView(capture.tracker, syncScheduler)('Clients List');

    const result = await middleware(ctx, emptyProps);

    expect(result).toEqual({ ctx });
  });
});
