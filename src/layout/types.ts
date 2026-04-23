import type { ReactNode } from 'react';

export type LayoutProps<TParams extends Record<string, string> = Record<string, string>> = {
  children: ReactNode;
  params: Promise<TParams>;
};
