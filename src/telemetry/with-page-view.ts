import type { EventProperties, EventTracker } from '@arckit/telemetry';
import type { PageProps } from '../page/types';
import { preservingAfter } from './preserving-after';
import type { Scheduler } from './scheduler';

type PropertiesExtractor<TCtx> = (ctx: TCtx) => EventProperties;

export const withPageView =
  (tracker: EventTracker, schedule: Scheduler = preservingAfter) =>
  <TCtx extends object>(name: string, extractProperties?: PropertiesExtractor<TCtx>) =>
  async (ctx: TCtx, _props: PageProps): Promise<{ ctx: TCtx }> => {
    const properties = extractProperties?.(ctx);
    schedule(() => {
      tracker.page({ name, ...(properties ? { properties } : {}) });
    });
    return { ctx };
  };
