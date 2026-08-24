# ESINSA WMS — Warehouse Management System

Sistema de gestión de almacén para **Esinsa Gaskets** (Pol. Ind. Riu Clar, Tarragona).
Intranet para empleados y operarios: inventario con códigos NUT, pedidos, picking con voz, trazabilidad de movimientos y asistente IA.

## Tech Stack

- **Frontend**: Astro 7 + React 19 + Tailwind CSS v4 + Zustand
- **Backend**: InsForge (Postgres + Auth + Realtime en la nube)
- **IA**: MiMo v2.5 (Xiaomi) vía API OpenAI-compatible
- **i18n**: Español, Inglés, Catalán, Francés
- **Persistencia**: InsForge Postgres (compartido entre todos los navegadores)
- **Auth**: InsForge Auth (email/password + OAuth) con roles (admin, manager, picker, formador, prácticas)

## Desarrollo local

```bash
bun install
bun run dev          # http://localhost:4321
bun run check        # typecheck frontend
bun run build        # build estático de producción
```

## Variables de entorno

Copiar `.env.example` a `.env` y rellenar (los valores se encuentran en `.insforge/project.json` y en los paneles de cada servicio):

| Variable | Descripción |
|---|---|
| `PUBLIC_INSFORGE_URL` | URL del proyecto InsForge |
| `PUBLIC_INSFORGE_ANON_KEY` | Anon key de InsForge (`npx -y @insforge/cli secrets get ANON_KEY`) |
| `PUBLIC_AI_ENDPOINT` | Endpoint de IA OpenAI-compatible |
| `PUBLIC_AI_KEY` | API key del proveedor de IA |
| `PUBLIC_AI_MODEL` | Modelo de IA (ej. `mimo-v2.5`) |

> **Importante:** Estas variables se incrustan en el bundle en **tiempo de build**. En Netlify/Cloudflare se configuran como Environment variables **antes** del primer build. Nunca commitear `.env` al repositorio.

---

## Despliegue en Cloudflare Pages (con tu dominio)

### Paso 1 — Build local

```bash
bun install
bun run build
```

Esto genera la carpeta `dist/` con el sitio estático.

### Paso 2 — Crear el proyecto en Cloudflare

1. Entra en [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Upload assets**.
2. Nombre del proyecto: `whm-esinsa` (o el que prefieras).
3. Sube la carpeta `dist/` arrastrándola o seleccionándola.
4. Haz clic en **Deploy site**.

### Paso 3 — Asociar tu dominio

1. Dentro del proyecto de Pages → **Custom domains** → **Set up a custom domain**.
2. Escribe el dominio que tienes en Cloudflare (ej. `whm.tudominio.com`).
3. Como el dominio ya está en tu cuenta de Cloudflare, **el registro DNS (CNAME) se configura automáticamente**. Solo acepta.
4. El SSL se provisiona solo en unos minutos.

### Paso 4 — Variables de entorno (para builds automáticos)

Si conectas el repo de GitHub en vez de subir `dist/` manualmente:

1. En el proyecto Pages → **Settings** → **Environment variables**.
2. Añade las 5 variables de la tabla de arriba (tanto para Production como Preview).
3. Configura: **Build command** = `bun install && bun run build` · **Output directory** = `dist`.
4. Cada push al repo hará un deploy automático.

### Paso 5 — Redirecciones SPA

Cloudflare Pages necesita un `_redirects` para que `/login`, `/register` y `/auth/callback` funcionen al navegar directamente. El archivo ya está incluido en `dist/_redirects` (Astro lo genera). Si necesitas añadir más rutas, crea `public/_redirects`:

```
/login    /login    200
/register /register 200
/auth/callback  /auth/callback  200
```

---

## Despliegue en Netlify

### Opción A — Drag & drop (para probar rápido)

1. Entra en [app.netlify.com](https://app.netlify.com) → **Add new site** → **Deploy manually**.
2. Arrastra la carpeta `dist/` al área de subida.
3. El sitio se publica en segundos con una URL tipo `https://random-name.netlify.app`.
4. En **Site settings** → **Change site name** para ponerle un nombre más corto.

> Las variables `PUBLIC_*` ya están incrustadas en el bundle (se definen en tiempo de build, no en el panel de Netlify). Si necesitas cambiarlas, haz un build nuevo localmente y vuelve a arrastrar `dist/`.

### Opción B — Conectando GitHub (deploys automáticos)

1. En Netlify → **Add new site** → **Import an existing project** → elige GitHub.
2. Selecciona el repositorio del proyecto.
3. Configuración del build:
   - **Build command:** `bun install && bun run build`
   - **Publish directory:** `dist`
4. En **Site settings** → **Environment variables**, añade las 5 variables de la tabla de arriba **antes** del primer build.
5. Haz clic en **Deploy site**. Cada push al repo desplegará automáticamente.

### Dominio personalizado en Netlify

1. En **Site settings** → **Domain management** → **Add custom domain**.
2. Escribe tu dominio (ej. `whm.tudominio.com`).
3. Netlify te dará un registro DNS (CNAME o A). Añádelo en tu proveedor de DNS (Cloudflare, etc.).
4. Activa HTTPS (Let's Encrypt) desde el panel de Netlify — se provisiona solo.

---

## Estructura del proyecto

```
src/
├── auth/roles.ts          # Modelo de capacidades y roles
├── components/dashboard/  # Vistas React (App, CrudView, Picking, Login...)
├── data/                  # Store (InsForge + fallback local), schemas, seed
├── hooks/                 # useAuth, useCollections, useFilters, useRoles...
├── i18n/                  # Diccionarios (es/en/ca/fr) + LocaleProvider
├── lib/                   # ai.ts, insforge.ts, picking.ts, csv.ts, idb.ts...
├── pages/                 # index.astro, login.astro, register.astro, auth/callback.astro
├── store/                 # Zustand store (appStore.ts)
├── styles/                # global.css (Tailwind + daisyUI)
└── types/                 # Tipos TypeScript del dominio
seed/
├── seed-insforge.ts       # Script para subir datos de ejemplo a InsForge
└── csv/                   # CSVs generados (inventory, orders, routes, crm)
```

## Roles y permisos

| Rol | Acceso |
|---|---|
| **admin** | Todo (dashboard, inventario, pedidos, picking, usuarios, roles, IA) |
| **manager** | Todo excepto gestión de usuarios y roles |
| **picker** | Inventario, picking, pedidos (lectura) |
| **formador** | Lectura global + picking + mensajería |
| **prácticas** | Dashboard, inventario, picking (lectura) |

## Seed de datos de ejemplo

```bash
bun run seed/seed-insforge.ts
```

Sube 48 registros de ejemplo (29 SKU con códigos NUT, recepciones, pedidos, rutas, CRM) a InsForge y genera CSVs en `seed/csv/`.
