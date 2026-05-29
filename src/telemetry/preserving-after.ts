import {
  getIdentity,
  getScope,
  getTrace,
  type Identity,
  runWithIdentity,
  runWithScope,
  runWithTrace,
  type TelemetryScope,
  type Traced
} from '@arckit/telemetry/context';
import { after } from 'next/server';
import type { Scheduler } from './scheduler';

export const restoreContext = (
  scope: TelemetryScope | undefined,
  identity: Identity | undefined,
  trace: Traced | undefined,
  fn: () => void
): void => {
  const withTrace = trace ? () => runWithTrace(trace, fn) : fn;
  const withIdentity = identity ? () => runWithIdentity(identity, withTrace) : withTrace;
  const withScope = scope ? () => runWithScope(scope, withIdentity) : withIdentity;
  withScope();
};

export const preservingAfter: Scheduler = (fn) => {
  const scope = getScope();
  const identity = getIdentity();
  const trace = getTrace();
  after(() => restoreContext(scope, identity, trace, fn));
};
