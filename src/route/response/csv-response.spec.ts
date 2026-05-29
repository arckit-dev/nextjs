import { describe, expect, it } from 'vitest';
import { csvResponse, csvStreamResponse } from './csv-response';

describe('csvResponse', () => {
  it('builds an attachment response carrying the csv content', async () => {
    const response = csvResponse('a,b\n1,2', { filename: 'export', withDate: false });

    expect(response.headers.get('Content-Type')).toBe('text/csv; charset=utf-8');
    expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="export.csv"');
    expect(await response.text()).toBe('a,b\n1,2');
  });
});

describe('csvStreamResponse', () => {
  it('streams the provided lines as a single csv payload', async () => {
    const response = csvStreamResponse(['a,b\n', '1,2\n'], { filename: 'export', withDate: false });

    expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="export.csv"');
    expect(await response.text()).toBe('a,b\n1,2\n');
  });
});
