import type { Metrics } from '@arckit/telemetry';
import type { PipeMiddleware, ServerActionResult } from '../action';
import { preservingAfter } from './preserving-after';
import type { Scheduler } from './scheduler';

const ACTIONS_TOTAL = 'actions_total';
const ACTION_DURATION_MS = 'action_duration_ms';

export const withMetrics = (metrics: Metrics, schedule: Scheduler = preservingAfter) => {
  const counter = metrics.counter(ACTIONS_TOTAL, { description: 'Number of server actions executed' });
  const histogram = metrics.histogram(ACTION_DURATION_MS, {
    description: 'Server action duration in milliseconds',
    unit: 'ms'
  });
  return <TCtx extends object>(action: string): PipeMiddleware<TCtx, object, unknown> =>
    async (ctx, _rawInput, next): Promise<ServerActionResult<unknown>> => {
      const start = performance.now();
      const result = await next(ctx);
      const status = result.success ? 'success' : 'failure';
      schedule(() => {
        counter.add(1, { action, status });
        histogram.record(performance.now() - start, { action, status });
      });
      return result;
    };
};
