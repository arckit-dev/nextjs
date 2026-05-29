import {
  getIdentity,
  getScope,
  getTrace,
  type Identity,
  runWithScope,
  type TelemetryScope,
  type Traced
} from '@arckit/telemetry/context';
import { describe, expect, it } from 'vitest';
import { deferWithContext, restoreContext } from './preserving-after';

describe('restoreContext', () => {
  it('makes the scope visible inside the wrapped callback', () => {
    const scope: TelemetryScope = { source: 'server', requestId: 'r1' };
    const { promise, resolve } = Promise.withResolvers<TelemetryScope | undefined>();
    restoreContext(scope, undefined, undefined, () => resolve(getScope()));
    return expect(promise).resolves.toEqual(scope);
  });

  it('makes the identity visible inside the wrapped callback', () => {
    const identity: Identity = { kind: 'identified', anonymousId: 'a1', userId: 'u1' };
    const { promise, resolve } = Promise.withResolvers<Identity | undefined>();
    restoreContext(undefined, identity, undefined, () => resolve(getIdentity()));
    return expect(promise).resolves.toEqual(identity);
  });

  it('makes the trace visible inside the wrapped callback', () => {
    const trace: Traced = { traceId: 't1', spanId: 's1' };
    const { promise, resolve } = Promise.withResolvers<Traced | undefined>();
    restoreContext(undefined, undefined, trace, () => resolve(getTrace()));
    return expect(promise).resolves.toEqual(trace);
  });

  it('restores all three layers simultaneously', () => {
    const scope: TelemetryScope = { source: 'edge', requestId: 'r1' };
    const identity: Identity = { kind: 'anonymous', anonymousId: 'a1' };
    const trace: Traced = { traceId: 't1', spanId: 's1' };
    const { promise, resolve } = Promise.withResolvers<{
      scope: TelemetryScope | undefined;
      identity: Identity | undefined;
      trace: Traced | undefined;
    }>();
    restoreContext(scope, identity, trace, () => resolve({ scope: getScope(), identity: getIdentity(), trace: getTrace() }));
    return expect(promise).resolves.toEqual({ scope, identity, trace });
  });

  it('invokes the callback synchronously even when no context is provided', () => {
    const { promise, resolve } = Promise.withResolvers<TelemetryScope | undefined>();
    restoreContext(undefined, undefined, undefined, () => resolve(getScope()));
    return expect(promise).resolves.toBeUndefined();
  });
});

describe('deferWithContext', () => {
  it('replays the scope captured at schedule time into a callback deferred past the active context', () => {
    const scope: TelemetryScope = { source: 'server', requestId: 'r1' };
    const deferred: Array<() => void> = [];
    const schedule = deferWithContext((callback) => deferred.push(callback));
    const { promise, resolve } = Promise.withResolvers<TelemetryScope | undefined>();

    runWithScope(scope, () => schedule(() => resolve(getScope())));
    deferred[0]?.();

    return expect(promise).resolves.toEqual(scope);
  });
});
