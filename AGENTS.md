## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Commands

- `bun run check` — typecheck frontend (`astro check`); fix before pushing.
- `bun run check:server` — typecheck backend (`tsc -p server/tsconfig.json`).
- `bun run dev:server` — backend de mensajería en `http://localhost:8787`.
- `bun run build` — production build.
- To test messaging end-to-end locally you need `server/` running (SQLite + SSE + webhooks).

## Roles & permissions

- `src/auth/roles.ts` — capability model (`Capability`), `DEFAULT_ROLES`, and helpers `can()`, `roleLabel()`, `resolveRoleId()`.
- `src/data/rolesStore.ts` — localStorage persistence of customized roles (`whm.roles`), with `resetRoles()` to restore defaults.
- `src/hooks/useRoles.ts` — reactive roles hook.
- UI is gated via `can(roleId, cap, roles)` in `src/components/dashboard/App.tsx` (nav items, view guards, Kitt panel, mock injection) and via `canEdit`/`canDelete` props on `CrudView`.
- Users reference roles by id in the `role` field; `LoginScreen` maps them with `resolveRoleId()`. Seeded roles (`admin`, `manager`, `picker`, `formador`, `practicas`) are merged into an existing DB without deleting custom users.
- `src/data/localStore.ts` uses `SEED_VERSION` (`whm.seed.version`) to run one-time seed merges when the seed data set changes; bump it to force a re-seed of missing rows.

## Project structure

- `src/` — Astro SPA (React island, Tailwind v4, IndexedDB stores).
- `server/` — Express + Drizzle + SQLite (libSQL) messaging backend. Telegram via long-polling, WhatsApp via Cloud API webhooks, SSE hub. Typechecked separately with `server/tsconfig.json`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
