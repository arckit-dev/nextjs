import type { ReactNode } from 'react';
import type { Provider } from '../shared/types';

export const applyProviders = (providers: Provider[], content: ReactNode): ReactNode =>
  providers.reduceRight<ReactNode>(
    (children, { component: Component, props }, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: providers order is stable
      <Component key={index} {...props}>
        {children}
      </Component>
    ),
    content
  );
