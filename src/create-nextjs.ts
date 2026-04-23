import type { InjectionKey } from 'piqure/src/Providing';
import { createUseServerAction } from './action/hook';
import { createWithProvide } from './action/middlewares/with-provide';
import { createClientBinder } from './client-binder';
import { createPageBuilder } from './page/page-builder';
import { createWithClientBinder } from './with-client-binder';

type Inject = <T>(key: InjectionKey<T>) => T;
type Provide = <T>(key: InjectionKey<T>, value: T) => void;
type ProvideLazy = <T>(key: InjectionKey<T>, factory: () => T) => void;

export type NextjsDependencies = {
  inject: Inject;
  provide: Provide;
  provideLazy: ProvideLazy;
};

export const createNextjs = ({ inject, provide, provideLazy }: NextjsDependencies) => {
  const ClientBinder = createClientBinder(provideLazy);
  const withClientBinder = createWithClientBinder(ClientBinder);
  const useServerAction = createUseServerAction(inject);
  const withProvide = createWithProvide(provide);
  const pageBuilder = createPageBuilder(withClientBinder);

  return { ClientBinder, withClientBinder, useServerAction, withProvide, pageBuilder };
};
