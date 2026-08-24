# Despliegue del WMS — Netlify, Vercel y Cloudflare Pages

La app es un SPA de Astro que habla **directamente con InsForge desde el navegador**
(`@insforge/sdk` con la anon key). No hay servidor propio que desplegar: los tres
hosts sirven solo los ficheros estáticos. El backend de mensajería de `server/`
(Telegram) es un proceso Node aparte y no va a estos hosts.

## Variables de entorno obligatorias (en TODAS las plataformas)

Estas variables se incrustan en el bundle en **tiempo de build** (por el prefijo
`PUBLIC_`). Hay que configurarlas en el panel de cada plataforma **antes** del
primer despliegue:

| Variable                  | Valor                                                    |
| ------------------------- | -------------------------------------------------------- |
| `PUBLIC_INSFORGE_URL`     | `https://5xz8euqt.ap-southeast.insforge.app`             |
| `PUBLIC_INSFORGE_ANON_KEY`| `npx -y @insforge/cli secrets get ANON_KEY`              |

Para cambiar de proyecto InsForge: `npx -y @insforge/cli link --project-id <ID>`
y actualizar las dos variables en cada plataforma.

## 1) Netlify

`netlify.toml` ya está preparado (build con bun + adapter Netlify + cabeceras).

```bash
# Una vez: instalar el CLI y enlazar la cuenta
npx netlify-cli login

# Despliegue (pregunta por el site; si no existe, lo crea)
npx netlify-cli deploy --prod
```

- Variables: Netlify > Site settings > **Environment variables** (las dos de arriba).
- Dominio: Netlify > **Domain management** > añadir el dominio y apuntar el DNS
  (CNAME) donde te diga Netlify.

## 2) Vercel

`vercel.json` ya está preparado (framework Astro + build con adapter Vercel).

```bash
# Una vez: login
npx vercel login

# Despliegue a producción (crea el proyecto en el primer deploy)
npx vercel --prod
```

- Variables: Vercel > Project > Settings > **Environment Variables**
  (Production/Preview/Development).
- Dominio: Vercel > Project > Settings > **Domains** > añadir el dominio
  (configura el DNS con el CNAME/A que indique Vercel).

## 3) Cloudflare Pages / Workers (con tu dominio de Cloudflare)

`wrangler.toml` está preparado. Para Pages, el build se configura en el panel.

**Opción A — por panel (recomendada para asociar tu dominio):**

1. Cloudflare dashboard > **Workers & Pages** > Create > **Pages** >
   "Connect to Git" (repositorio del proyecto) o "Upload assets".
2. Framework preset: **Astro**; build command: `bun run build`;
   output directory: `dist`.
3. En **Settings > Environment variables** añade las dos variables de InsForge.
4. **Custom domains** > Set up a custom domain > escribe tu dominio (como el
   dominio está en la misma cuenta de Cloudflare, el DNS se configura solo
   automáticamente).

**Opción B — por CLI (wrangler):**

```bash
npx wrangler login

# Despliegue estático directo (el build se hace en local):
bun run build
npx wrangler pages deploy dist --project-name whm-esinsa

# Dominio (una vez creado el proyecto):
npx wrangler pages project list            # para ver el nombre exacto
# El dominio se asocia desde el panel (Workers & Pages > tu proyecto > Custom domains)
```

- Con wrangler puedes crear el proyecto y gestionar las variables con
  `npx wrangler pages project create whm-esinsa`.

## Despliegue estático genérico (sin adapter)

Sin `ASTRO_ADAPTER` el build es 100 % estático (`dist/`). Sirve para cualquier
host de ficheros (GitHub Pages, VPS con nginx/caddy, etc.):

```bash
bun install
bun run build   # -> dist/
```

## Notas

- **Builds con adapter**: si algún día hay `prerender = false` (SSR/acciones),
  elige el adapter de la plataforma con `ASTRO_ADAPTER=netlify|vercel|cloudflare`
  (ya cableado en `astro.config.mjs`).
- **Backend de mensajería** (`server/`, puerto 8787): no se despliega aquí.
  Para la intranet no es imprescindible (la sincronización entre navegadores la
  hará InsForge Realtime). Cuando haga falta, se aloja en un VPS o se migra a
  funciones de InsForge.
- **CORS**: la app no necesita CORS (todo el tráfico va del navegador a InsForge).
