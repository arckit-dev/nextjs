import { describe, expect, it, vi } from 'vitest';
import { actionBuilder, type PipeMiddleware } from './action-builder';

const withValue =
  <TKey extends string, TValue>(key: TKey, value: TValue): PipeMiddleware<object, { [K in TKey]: TValue }, unknown> =>
  async (_ctx, _rawInput, next) =>
    next({ [key]: value } as { [K in TKey]: TValue });

const withDelay =
  <TKey extends string, TValue>(
    key: TKey,
    value: TValue,
    ms: number
  ): PipeMiddleware<object, { [K in TKey]: TValue }, unknown> =>
  async (_ctx, _rawInput, next) => {
    await new Promise((resolve) => setTimeout(resolve, ms));
    return next({ [key]: value } as { [K in TKey]: TValue });
  };

describe('actionBuilder', () => {
  it('should execute handler without middlewares', async () => {
    const action = actionBuilder().execute(async () => 'result');

    expect(await action()).toEqual({ success: true, data: 'result' });
  });

  it('should pass middleware context to handler', async () => {
    const action = actionBuilder()
      .use(withValue('name', 'test'))
      .execute(async (ctx) => ctx.name);

    expect(await action()).toEqual({ success: true, data: 'test' });
  });

  it('should chain sequential middlewares', async () => {
    const action = actionBuilder()
      .use(withValue('a', 1))
      .use(withValue('b', 2))
      .execute(async (ctx) => ctx.a + ctx.b);

    expect(await action()).toEqual({ success: true, data: 3 });
  });

  it('should execute parallel middlewares in same use call', async () => {
    const order: string[] = [];

    const trackA: PipeMiddleware<object, { a: number }, unknown> = async (_ctx, _rawInput, next) => {
      order.push('a-start');
      await new Promise((resolve) => setTimeout(resolve, 20));
      order.push('a-end');
      return next({ a: 1 });
    };

    const trackB: PipeMiddleware<object, { b: number }, unknown> = async (_ctx, _rawInput, next) => {
      order.push('b-start');
      await new Promise((resolve) => setTimeout(resolve, 10));
      order.push('b-end');
      return next({ b: 2 });
    };

    const action = actionBuilder()
      .use(trackA, trackB)
      .execute(async (ctx) => ctx.a + ctx.b);

    const result = await action();

    expect(result).toEqual({ success: true, data: 3 });
    expect(order[0]).toBe('a-start');
    expect(order[1]).toBe('b-start');
  });

  it('should merge context from parallel middlewares', async () => {
    const action = actionBuilder()
      .use(withValue('a', 'hello'), withValue('b', 'world'))
      .execute(async (ctx) => `${ctx.a} ${ctx.b}`);

    expect(await action()).toEqual({ success: true, data: 'hello world' });
  });

  it('should mix sequential and parallel use calls', async () => {
    const action = actionBuilder()
      .use(withValue('a', 1), withValue('b', 2))
      .use(withValue('c', 3))
      .execute(async (ctx) => ctx.a + ctx.b + ctx.c);

    expect(await action()).toEqual({ success: true, data: 6 });
  });

  it('should catch errors and return error result', async () => {
    const action = actionBuilder().execute(async () => {
      throw new Error('boom');
    });

    expect(await action()).toEqual({ success: false, error: expect.any(Error) });
  });

  it('should apply error prefix', async () => {
    const action = actionBuilder({ errorPrefix: 'global' }).execute(async () => {
      throw 'test.error';
    });

    expect(await action()).toEqual({ success: false, error: 'global.test.error' });
  });

  it('should pass rawInput through pipeline', async () => {
    const capture: PipeMiddleware<object, { input: string }, unknown> = async (_ctx, rawInput, next) =>
      next({ input: rawInput as string });

    const action = actionBuilder()
      .use(capture)
      .execute(async (ctx) => ctx.input);

    expect(await action('hello')).toEqual({ success: true, data: 'hello' });
  });
});
