import type { PageProps } from '../types';

export const withPagination =
  (parse: (value: unknown) => number) =>
  async (_ctx: object, props: PageProps): Promise<{ ctx: { page: number } }> => {
    const searchParams = await props.searchParams;
    return { ctx: { page: parse(searchParams['page']) } };
  };
