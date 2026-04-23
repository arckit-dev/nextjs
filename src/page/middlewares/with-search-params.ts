import type { PageProps } from '../types';

type SearchParamsResult<T> = { searchParams: T; urlSearchParams: URLSearchParams };

const toUrlSearchParams = (raw: Record<string, string | string[] | undefined>): URLSearchParams => {
  const urlSearchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value)) {
      for (const v of value) urlSearchParams.append(key, v);
    } else if (value !== undefined) {
      urlSearchParams.set(key, value);
    }
  }
  return urlSearchParams;
};

export function withSearchParams<TSearchParams>(
  parse: (raw: Record<string, string | string[] | undefined>) => TSearchParams
): (ctx: object, props: PageProps) => Promise<{ ctx: SearchParamsResult<TSearchParams> }>;

export function withSearchParams<
  TSearchParams extends Record<string, string | string[] | undefined> = Record<string, string | string[] | undefined>
>(): (ctx: object, props: PageProps) => Promise<{ ctx: SearchParamsResult<TSearchParams> }>;

export function withSearchParams(parse?: (raw: Record<string, string | string[] | undefined>) => unknown) {
  return async (_ctx: object, props: PageProps) => {
    const raw = (await props.searchParams) ?? {};
    const searchParams = parse ? parse(raw) : raw;
    return { ctx: { searchParams, urlSearchParams: toUrlSearchParams(raw) } };
  };
}
