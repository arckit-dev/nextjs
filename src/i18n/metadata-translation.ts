import type { I18nConfig, Namespace } from '@arckit/i18n';
import { RESOURCE_LOADER } from '@arckit/i18n';
import type { Metadata } from 'next';
import type { InjectionKey } from 'piqure/src/Providing';
import { getLang } from './with-i18n';

type Inject = <T>(key: InjectionKey<T>) => T;

export type MetadataTranslation = () => Promise<Metadata>;

export const createMetadataTranslation =
  (inject: Inject) =>
  (config: I18nConfig) =>
  (namespace: Namespace): MetadataTranslation =>
  async (): Promise<Metadata> => {
    const lng = await getLang(config);
    const loadResources = inject(RESOURCE_LOADER);
    const resources = await loadResources(lng, [namespace]);
    const namespaceResources = resources[namespace] as { metadata?: Metadata };

    return namespaceResources.metadata ?? {};
  };
