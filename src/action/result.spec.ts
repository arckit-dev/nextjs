import { describe, expect, it } from 'vitest';
import { ServerActionError, ServerActionSuccess } from './result';

describe('ServerActionSuccess', () => {
  it('should create a success result with data', () => {
    expect(ServerActionSuccess({ id: '1' })).toEqual({ success: true, data: { id: '1' } });
  });

  it('should create a success result without data', () => {
    expect(ServerActionSuccess()).toEqual({ success: true, data: undefined });
  });
});

describe('ServerActionError', () => {
  it('should create an error result', () => {
    expect(ServerActionError('error.notFound')).toEqual({ success: false, error: 'error.notFound' });
  });
});
