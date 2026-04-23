# @arckit/nextjs

Next.js App Router utilities — page/layout/action/route builders with middleware pipeline.

[![npm version](https://img.shields.io/npm/v/@arckit/nextjs)](https://www.npmjs.com/package/@arckit/nextjs)
[![npm downloads](https://img.shields.io/npm/dm/@arckit/nextjs)](https://www.npmjs.com/package/@arckit/nextjs)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@arckit/nextjs)](https://bundlephobia.com/package/@arckit/nextjs)
[![codecov](https://codecov.io/gh/arckit-dev/nextjs/graph/badge.svg)](https://codecov.io/gh/arckit-dev/nextjs)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## Table of Contents

- [About](#about)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

<h2 id="about">About</h2>

Type-safe middleware pipeline builders for Next.js App Router. Provides `pageBuilder`, `layoutBuilder`, `actionBuilder`, and `routeBuilder` with composable middlewares, server action utilities, and dependency injection via the factory pattern.

<h2 id="installation">Installation</h2>

```bash
pnpm add @arckit/nextjs
```

<h2 id="usage">Usage</h2>

### Setup with factory pattern

```typescript
// configuration/nextjs/index.ts
import { createNextjs } from '@arckit/nextjs';
import { inject, provide, provideLazy } from '@/configuration/injection';

export const { pageBuilder, useServerAction, withProvide, withClientBinder } =
  createNextjs({ inject, provide, provideLazy });
```

### Page builder

```typescript
import { pageBuilder } from '@/configuration/nextjs';
import { withI18n } from '@/configuration/i18n';

export default pageBuilder()
  .use(withI18n(i18n)('namespace'))
  .render(async () => <Page />);
```

### Action builder

```typescript
import { actionBuilder, withInput } from '@arckit/nextjs';
import { withLogger } from '@/configuration/logger';

export const myAction = actionBuilder()
  .use(withInput(validation))
  .use(withLogger('action-name'))
  .execute(async ({ input }) => result);
```

### Server action hook

```typescript
import { useServerAction } from '@/configuration/nextjs';

const [dispatch, isPending, result] = useServerAction(myAction, {
  onSuccess: (state) => console.log(state.result),
  onError: (state) => console.error(state.error)
});
```

<h2 id="contributing">Contributing</h2>

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

<h2 id="license">License</h2>

[MIT](LICENSE) &copy; Marc Gavanier
