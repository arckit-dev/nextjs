import { Page } from '@arckit/resultset';
import type { PageProps } from '../types';

export function withPagination(): (_ctx: object, props: PageProps) => Promise<{ ctx: { page: Page } }>;
export function withPagination(
  parse: (value: unknown) => number
): (_ctx: object, props: PageProps) => Promise<{ ctx: { page: number } }>;
export function withPagination(parse?: (value: unknown) => number) {
  return async (_ctx: object, props: PageProps) => {
    const searchParams = await props.searchParams;
    const raw = searchParams['page'];
    const page = parse ? parse(raw) : Page(typeof raw === 'string' ? parseInt(raw, 10) || 1 : 1);
    return { ctx: { page } };
  };
}
