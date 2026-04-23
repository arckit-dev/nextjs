import { describe, expect, it } from 'vitest';
import { hrefWithSearchParams } from './href-with-search-params';

describe('hrefWithSearchParams', () => {
  it('should return href without params when no search params', () => {
    expect(hrefWithSearchParams('/clients')()).toBe('/clients');
  });

  it('should append search params to href', () => {
    const params = new URLSearchParams({ page: '2', sort: 'name' });
    expect(hrefWithSearchParams('/clients')(params)).toBe('/clients?page=2&sort=name');
  });

  it('should exclude specified params', () => {
    const params = new URLSearchParams({ page: '2', sort: 'name', filter: 'active' });
    expect(hrefWithSearchParams('/clients')(params, ['filter'])).toBe('/clients?page=2&sort=name');
  });

  it('should return href only when all params are excluded', () => {
    const params = new URLSearchParams({ page: '2' });
    expect(hrefWithSearchParams('/clients')(params, ['page'])).toBe('/clients');
  });

  it('should handle empty href', () => {
    const params = new URLSearchParams({ page: '2' });
    expect(hrefWithSearchParams()(params)).toBe('?page=2');
  });
});
