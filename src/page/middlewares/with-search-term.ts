import { Search } from '@arckit/resultset';
import type { PageProps } from '../types';

export const withSearchTerm =
  () =>
  async (_ctx: object, props: PageProps): Promise<{ ctx: { search: Search } }> => {
    const searchParams = await props.searchParams;
    const raw = searchParams['search'];
    return { ctx: { search: Search(typeof raw === 'string' ? raw : '') } };
  };
