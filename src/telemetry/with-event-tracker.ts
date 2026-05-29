import type { EventName, EventProperties, EventTracker } from '@arckit/telemetry';
import type { PipeMiddleware, ServerActionResult } from '../action';
import type { Scheduler } from './scheduler';

type PropertiesExtractor<TCtx> = (ctx: TCtx) => EventProperties;

type WithEventTrackerOptions<TCtx> = {
  readonly extractProperties?: PropertiesExtractor<TCtx>;
};

export const withEventTracker =
  (tracker: EventTracker, schedule: Scheduler) =>
  <TCtx extends object>(
    event: EventName,
    { extractProperties }: WithEventTrackerOptions<TCtx> = {}
  ): PipeMiddleware<TCtx, object, unknown> =>
  async (ctx, _rawInput, next): Promise<ServerActionResult<unknown>> => {
    const result = await next(ctx);

    if (result.success) {
      schedule(() => {
        tracker.track({ event, properties: extractProperties?.(ctx) });
      });
    }

    return result;
  };
