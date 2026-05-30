# [2.0.0](https://github.com/arckit-dev/nextjs/compare/v1.15.0...v2.0.0) (2026-05-30)


* feat!: validator-agnostic decode via Standard Schema, isolate effect ([2690a97](https://github.com/arckit-dev/nextjs/commit/2690a97ff55986cbfb6d23c5a60b11d20c44bdc6))


### BREAKING CHANGES

* fromEither moves to @arckit/nextjs/action/either;
withEither/withOptionalEither move to @arckit/nextjs/page/middlewares/either;
withDecode's tagged `handlers` arg is replaced by a single `onInvalid` callback
(default notFound).

# [1.15.0](https://github.com/arckit-dev/nextjs/compare/v1.14.0...v1.15.0) (2026-05-29)


### Features

* **client,route:** add ./client/bindings subpath and route withParams middleware ([ff8be06](https://github.com/arckit-dev/nextjs/commit/ff8be06d8bbb843903b64e6cfb6c00e5ba963959))

# [1.14.0](https://github.com/arckit-dev/nextjs/compare/v1.13.0...v1.14.0) (2026-05-29)


### Features

* **action,page:** ./action subpath, validator-agnostic withInput, createWithClientBinder on ./page ([a717d7c](https://github.com/arckit-dev/nextjs/commit/a717d7c76e281a33fb2c4ff59ea5e7fc538e88c2))
* **data,layout:** cache-aware withFetch and ./layout subpath ([0448863](https://github.com/arckit-dev/nextjs/commit/04488631933f5809df1500fa26412b2a5045ba7f))
* **route:** add ./route subpath with required guard and csv helpers ([2305756](https://github.com/arckit-dev/nextjs/commit/23057565e47ff7cb756db8be0cca4173be8908cc))

# [1.13.0](https://github.com/arckit-dev/nextjs/compare/v1.12.0...v1.13.0) (2026-05-29)


### Features

* **page:** add ./page and ./page/middlewares subpath exports ([b224853](https://github.com/arckit-dev/nextjs/commit/b224853b3da998af0ea667fa4f5fc8d7d6c0a5f4))

# [1.12.0](https://github.com/arckit-dev/nextjs/compare/v1.11.0...v1.12.0) (2026-05-29)


### Features

* **page:** add redirectTo finalizer and extend use overloads to six ([9f7e59b](https://github.com/arckit-dev/nextjs/commit/9f7e59bc1e7592caa51df42c4d1714e2110c9749))

# [1.11.0](https://github.com/arckit-dev/nextjs/compare/v1.10.0...v1.11.0) (2026-05-29)


### Features

* **telemetry:** expose deferWithContext seam and cover preservingAfter ([7d5d8ed](https://github.com/arckit-dev/nextjs/commit/7d5d8ed8e7817c5e07b05b57eb810e5104cbb193))

# [1.10.0](https://github.com/arckit-dev/nextjs/compare/v1.9.0...v1.10.0) (2026-05-29)


### Features

* **telemetry:** ship preservingAfter scheduler and default to it ([590a790](https://github.com/arckit-dev/nextjs/commit/590a79028835f82c34e7856c23be3b68b7fe2f65))

# [1.9.0](https://github.com/arckit-dev/nextjs/compare/v1.8.0...v1.9.0) (2026-05-29)


### Features

* **telemetry:** add server-action and page middlewares subpath ([de793a9](https://github.com/arckit-dev/nextjs/commit/de793a939511ee287d4b9f25863b74dcc134c00f))

# [1.8.0](https://github.com/arckit-dev/nextjs/compare/v1.7.0...v1.8.0) (2026-05-28)


### Features

* **page:** add optional wrap decorator to createPageBuilder ([839ceb1](https://github.com/arckit-dev/nextjs/commit/839ceb1da1f4053f9a880be3b44ec258150f90ea))

# [1.7.0](https://github.com/arckit-dev/nextjs/compare/v1.6.0...v1.7.0) (2026-05-20)


### Features

* expose all client-safe modules on /client subpath ([baa8335](https://github.com/arckit-dev/nextjs/commit/baa8335354323b0231693afcb1e7396617dfed76))

# [1.6.0](https://github.com/arckit-dev/nextjs/compare/v1.5.0...v1.6.0) (2026-05-09)


### Features

* add pagination and search term middlewares ([eff284b](https://github.com/arckit-dev/nextjs/commit/eff284b73f2d58d33be0f1827aaf560bb44bf3c5))

# [1.5.0](https://github.com/arckit-dev/nextjs/compare/v1.4.0...v1.5.0) (2026-05-05)


### Features

* add variadic use() to actionBuilder for parallel middleware execution ([5e326a7](https://github.com/arckit-dev/nextjs/commit/5e326a7dcd359ab5b8012b116d30465f9d37a0cb))

# [1.4.0](https://github.com/arckit-dev/nextjs/compare/v1.3.1...v1.4.0) (2026-05-05)


### Features

* add withOptionalEither page middleware ([a5a2afc](https://github.com/arckit-dev/nextjs/commit/a5a2afcc3b69c7ceb52223d3080bb1d7f67dc257))

## [1.3.1](https://github.com/arckit-dev/nextjs/compare/v1.3.0...v1.3.1) (2026-04-24)


### Bug Fixes

* pass I18nProvider as parameter to avoid client import in server bundle ([d7fd3e7](https://github.com/arckit-dev/nextjs/commit/d7fd3e77f914add69d069c7ef92a9e2ecfd57d9f))

# [1.3.0](https://github.com/arckit-dev/nextjs/compare/v1.2.0...v1.3.0) (2026-04-24)


### Features

* add i18n subpath with createWithI18n, createWithLang, createMetadataTranslation ([ad7b9fa](https://github.com/arckit-dev/nextjs/commit/ad7b9fad9b451e8710d41be5995e22d16cc46e94))

# [1.2.0](https://github.com/arckit-dev/nextjs/compare/v1.1.0...v1.2.0) (2026-04-24)


### Features

* expose elementary factories, remove wrapper createNextjs ([35e3ea2](https://github.com/arckit-dev/nextjs/commit/35e3ea24a9e1c08cc22d6a8ac4104f4100cd865c))

# [1.1.0](https://github.com/arckit-dev/nextjs/compare/v1.0.0...v1.1.0) (2026-04-24)


### Bug Fixes

* regenerate lockfile after removing self-reference ([572bda5](https://github.com/arckit-dev/nextjs/commit/572bda5eec2c97bf1f88b965992b6e1d517ad5d4))
* remove self-referencing dependency ([45b7cef](https://github.com/arckit-dev/nextjs/commit/45b7cefe2bcc13ea9595999ec661101c0bbd3752))


### Features

* separate client and server entry points ([9fa0f97](https://github.com/arckit-dev/nextjs/commit/9fa0f9749c7483b443f7a46879c4214c25688907))

# 1.0.0 (2026-04-24)


### Bug Fixes

* add missing peer deps and remove unused files ([536a1c3](https://github.com/arckit-dev/nextjs/commit/536a1c36132363e84e5ab2f2e65407c9f5d9d438))


### Features

* initial Next.js App Router utilities package ([6e57e7f](https://github.com/arckit-dev/nextjs/commit/6e57e7f1ed0f30d87dd6a865e8507703f390e651))
