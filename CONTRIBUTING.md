# Contributing

## Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (v22+)
- [pnpm](https://pnpm.io/) (v10+)

## Getting Started

```bash
git clone git@github.com:arckit-dev/nextjs.git
cd nextjs
pnpm install
pnpm test
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm build` | Build with tsup (ESM + CJS + declarations) |
| `pnpm dev` | Build in watch mode |
| `pnpm test` | Run Vitest unit tests |
| `pnpm test:coverage` | Run tests with coverage |
| `pnpm typecheck` | Type-check with TypeScript |
| `pnpm lint:code` | Lint and format with Biome |
| `pnpm lint:unused` | Detect unused deps with knip |
| `pnpm check:publint` | Validate package.json |
| `pnpm check:attw` | Verify types resolution |
| `pnpm check:size` | Check bundle size |

## Requirements

- Conventional branch prefixes: `feat/`, `fix/`, `chore/`, etc.
- [Conventional Commits](https://www.conventionalcommits.org/)
- GPG-signed commits

## CI/CD

| Workflow | Trigger | Description |
|----------|---------|-------------|
| CI | Push to main / PR | Lint, type-check, test, build, package quality |
| Release | Push to main | Publish to npm via semantic-release |

### Required Secrets

| Secret | Description |
|--------|-------------|
| `NPM_TOKEN` | npm granular access token scoped to `@arckit` |
| `CODECOV_TOKEN` | Codecov upload token |

## Versioning

[Semantic Versioning 2.0.0](https://semver.org/)
