export const hrefWithSearchParams =
  (href = '') =>
  (searchParams?: URLSearchParams, exclude: string[] = []): string => {
    const params = searchParams ? new URLSearchParams(searchParams) : undefined;
    for (const param of exclude) params?.delete(param);
    const paramsString = params?.toString();
    return paramsString ? `${href}?${paramsString}` : href;
  };
