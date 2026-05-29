type CsvResponseOptions = {
  filename: string;
  withDate?: boolean;
};

const dateSuffixOf = (withDate: boolean): string => (withDate ? `-${new Date().toISOString().split('T')[0]}` : '');

export const csvResponse = (content: string, { filename, withDate = true }: CsvResponseOptions): Response =>
  new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}${dateSuffixOf(withDate)}.csv"`
    }
  });

export const csvStreamResponse = (lines: Iterable<string>, { filename, withDate = true }: CsvResponseOptions): Response => {
  const encoder = new TextEncoder();
  const iterator = lines[Symbol.iterator]();

  const stream = new ReadableStream({
    pull(controller) {
      const { value, done } = iterator.next();
      if (done) controller.close();
      else controller.enqueue(encoder.encode(value));
    }
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}${dateSuffixOf(withDate)}.csv"`,
      'Transfer-Encoding': 'chunked'
    }
  });
};
