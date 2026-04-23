import type { InjectionKey } from 'piqure/src/Providing';
import type { ComponentType, ReactNode } from 'react';

type ClientBinderComponent = ComponentType<{ bind: InjectionKey<unknown>; to: unknown; children: ReactNode }>;

export const createWithClientBinder =
  (ClientBinder: ClientBinderComponent) =>
  <TBind, TTo extends TBind>(bind: InjectionKey<TBind>, to: TTo) =>
  async () => ({
    ctx: {},
    provider: {
      component: ClientBinder as ComponentType<{ bind: InjectionKey<TBind>; to: TTo; children: ReactNode }>,
      props: { bind, to }
    }
  });
