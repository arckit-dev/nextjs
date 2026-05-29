import type { InjectionKey } from 'piqure/src/Providing';
import { describe, expect, it } from 'vitest';
import { createPageBuilder } from './page-builder';
import type { PageProps } from './types';

const noopBinder =
  <TBind, TTo extends TBind>(_bind: InjectionKey<TBind>, _to: TTo) =>
  async (ctx: Record<string, unknown>) => ({ ctx });

const pageBuilder = createPageBuilder(noopBinder);

const props: PageProps = { params: Promise.resolve({}), searchParams: Promise.resolve({}) };

const redirectDigestOf = async (route: (props: PageProps) => Promise<never>): Promise<string | undefined> => {
  try {
    await route(props);
    return undefined;
  } catch (error) {
    return (error as { digest?: string }).digest;
  }
};

describe('createPageBuilder wrap option', () => {
  it('renders without a wrapper when none is provided', async () => {
    const route = pageBuilder().render(async () => 'content');

    expect(await route(props)).toBe('content');
  });

  it('runs the route inside the provided wrapper', async () => {
    const order: string[] = [];
    const route = createPageBuilder(noopBinder)({
      wrap: async (run) => {
        order.push('before');
        const result = await run();
        order.push('after');
        return result;
      }
    }).render(async () => {
      order.push('render');
      return 'content';
    });

    const result = await route(props);

    expect(result).toBe('content');
    expect(order).toEqual(['before', 'render', 'after']);
  });
});

describe('createPageBuilder redirectTo', () => {
  it('runs the middlewares then redirects to the url built from the resolved context', async () => {
    const withSlug = async (ctx: Record<string, unknown>) => ({ ctx: { ...ctx, slug: 'occitanie' } });

    const route = pageBuilder()
      .use(withSlug)
      .redirectTo((ctx) => `/regions/${ctx.slug}`);

    expect(await redirectDigestOf(route)).toContain(';/regions/occitanie;');
  });

  it('redirects through the provided wrapper', async () => {
    const route = createPageBuilder(noopBinder)({ wrap: async (run) => run() }).redirectTo(() => '/home');

    expect(await redirectDigestOf(route)).toContain(';/home;');
  });
});
