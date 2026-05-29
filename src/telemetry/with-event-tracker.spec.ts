import type { EventRecord, EventTracker, IdentifyEvent, PageEvent, TrackedEvent } from '@arckit/telemetry';
import { describe, expect, it } from 'vitest';
import { withEventTracker } from './with-event-tracker';

const ServerActionSuccess = <T = void>(data?: T) => ({ success: true as const, data });
const ServerActionError = <T extends string>(error: T) => ({ success: false as const, error });

const syncScheduler = (fn: () => void): void => fn();

const captureTrack = (): { tracker: EventTracker; observe: () => Promise<TrackedEvent> } => {
  const { resolve, promise } = Promise.withResolvers<TrackedEvent>();
  return {
    tracker: {
      track: (event: TrackedEvent): EventRecord => {
        resolve(event);
        return {};
      },
      identify: (_: IdentifyEvent): EventRecord => ({}),
      page: (_: PageEvent): EventRecord => ({})
    },
    observe: () => promise
  };
};

describe('withEventTracker', () => {
  it('fires track with the configured event name on action success', async () => {
    const capture = captureTrack();
    const middleware = withEventTracker(capture.tracker, syncScheduler)('Order Completed');

    await middleware({}, {}, async () => ServerActionSuccess());

    expect((await capture.observe()).event).toBe('Order Completed');
  });

  it('passes properties extracted from the context', async () => {
    const capture = captureTrack();
    type Ctx = { input: { orderId: string } };
    const middleware = withEventTracker(capture.tracker, syncScheduler)<Ctx>('Order Completed', {
      extractProperties: (ctx) => ({ orderId: ctx.input.orderId })
    });

    await middleware({ input: { orderId: 'o1' } }, {}, async () => ServerActionSuccess());

    expect((await capture.observe()).properties).toEqual({ orderId: 'o1' });
  });

  it('returns the success result unchanged', async () => {
    const capture = captureTrack();
    const middleware = withEventTracker(capture.tracker, syncScheduler)('Order Completed');

    const result = await middleware({}, {}, async () => ServerActionSuccess({ id: 'o1' }));

    expect(result).toEqual({ success: true, data: { id: 'o1' } });
  });

  it('returns the failure result unchanged', async () => {
    const capture = captureTrack();
    const middleware = withEventTracker(capture.tracker, syncScheduler)('Order Completed');

    const result = await middleware({}, {}, async () => ServerActionError('NotEnoughStock'));

    expect(result).toEqual({ success: false, error: 'NotEnoughStock' });
  });

  it('does not fire track when the action fails', async () => {
    let fired = false;
    const tracker: EventTracker = {
      track: (): EventRecord => {
        fired = true;
        return {};
      },
      identify: (): EventRecord => ({}),
      page: (): EventRecord => ({})
    };
    const middleware = withEventTracker(tracker, syncScheduler)('Order Completed');

    await middleware({}, {}, async () => ServerActionError('NotEnoughStock'));

    expect(fired).toBe(false);
  });
});
