import { unstable_cache } from 'next/cache';

/* v8 ignore start -- thin wrapper over next/cache unstable_cache; requires a Next runtime, not unit-testable without mocks */
export const cached = <TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  keyParts: string[],
  options: { revalidate: number | false; tags?: string[] }
) => unstable_cache(fn, keyParts, { revalidate: options.revalidate, ...(options.tags ? { tags: options.tags } : {}) });
/* v8 ignore stop */
