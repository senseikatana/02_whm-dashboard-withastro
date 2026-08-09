# WarehouseFlow · WMS Dashboard

Panel de operaciones de almacén (WMS) construido con **Astro + React** y estilado con **Tailwind CSS v4**.

## Arquitectura

- **Frontend (Astro + React)**: dashboard SPA con vista de inventario, picking, recepciones, expediciones, rutas, CRM, mensajería y administración de roles y permisos.
- **Almacenamiento local**: los datos de negocio (colecciones CRUD) se guardan en **IndexedDB** nativa del navegador. Las preferencias pequeñas (operador, tema, roles personalizados) viven en `localStorage`.
- **Roles y permisos**: modelo de capacidades en `src/auth/roles.ts`. Cada rol define qué vistas puede abrir y qué puede editar/borrar; los roles predeterminados se siembran y los personalizados se guardan en `localStorage` (`whm.roles`) desde la vista **Roles**.
- **Backend de mensajería** (`server/`): **Express + Drizzle ORM + SQLite (libSQL)**. Es la fuente de verdad de chats y mensajes de **WhatsApp (Cloud API)** y **Telegram**. El front cachea los mensajes en IndexedDB y se sincroniza por **SSE**.
- **Autenticación**: si hay credenciales de **Supabase Auth** en el entorno, el login usa email/contraseña y los JWT protegen el API de mensajería. Sin credenciales, cae a **modo demo** con operadores locales en IndexedDB.
- **Tema**: claro y oscuro, con toggle persistente y sin flash (FOUC) al cargar.

## Requisitos

- Node.js ≥ 22 o [Bun](https://bun.sh) (recomendado).

## Comandos

```sh
bun install            # instala dependencias
bun run dev            # frontend en http://localhost:4321
bun run dev:server     # backend de mensajería en http://localhost:8787
bun run dev:all        # frontend (background) + backend
bun run check          # chequeo de tipos del frontend (astro check)
bun run check:server   # chequeo de tipos del backend (tsc)
bun run build          # build de producción en ./dist/
bun run seed:supabase  # crea la tabla profiles y los usuarios de Supabase Auth
```

> Si solo usás el frontend (demo local), el backend no es necesario: las colecciones CRUD funcionan 100% contra IndexedDB.

## Configuración

### Frontend (`.env`)

```env
# Opcional: endpoint de IA para el reporte del dashboard y el copilot
PUBLIC_AI_ENDPOINT=https://...
# Opcional: base del backend de mensajería (default http://localhost:8787)
PUBLIC_API_BASE=http://localhost:8787

# Opcional: habilitan Supabase Auth (login por email/contraseña + JWT en el API)
PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Autenticación con Supabase Auth

Sin `PUBLIC_SUPABASE_URL`/`PUBLIC_SUPABASE_ANON_KEY` la app arranca en **modo demo** (operadores locales en IndexedDB). Con esas variables, el login pasa a email/contraseña contra Supabase:

1. En Supabase: **Authentication → Providers → Email**, habilitá *Email* (sin confirmación requerida para uso interno).
2. Cargá en `.env` además de las públicas: `SUPABASE_SECRET_KEY` (service role), `SUPABASE_JWKS_URL` (`https://<ref>.supabase.co/auth/v1/.well-known/jwks.json`) y `DATABASE_URL` (connection string del **Session pooler** en Supabase → Database → Connection string).
3. Sembrá usuarios:

   ```sh
   bun run seed:supabase
   ```

   Crea los accesos demo **`admin@admin.com` / `admin12345678`** y **`picker@demo.com` / `admin12345678`**, más los usuarios por rol `<role_id>@warehouse.local` (contraseña por defecto `Cambiame123!`, sobreescribible con `SEED_USER_PASSWORD`). Todos quedan confirmados. El `role_id` y el nombre se guardan en `user_metadata`; si `DATABASE_URL` responde, además sincroniza la tabla `profiles`.

4. **Registrarse**: en la pantalla de login, `Registrate` crea una cuenta con email, contraseña, nombre y rol. Si el proyecto tiene *Confirm email* activo, hay que confirmar el link del email antes del primer login (para una demo sin fricción, desactivarlo en Authentication → Providers → Email). Nota: el registro permite elegir cualquier rol, incluido admin — adecuado para un panel interno, no para producción pública.

5. Los JWT de la sesión viajan como `Authorization: Bearer <token>` (o `?token=` en el SSE). El backend valida contra el JWKS de Supabase cuando `SUPABASE_JWKS_URL` está presente en el entorno que corre el server; sin ella, las rutas quedan abiertas (desarrollo local).

### Backend de mensajería (`server/.env`)

Copiá `server/.env.example` a `server/.env` y completá los tokens. La base SQLite se crea sola en `server/data/whm.db`.

#### Telegram (con BotFather)

1. En Telegram, hablá con **@BotFather** y ejecutá `/newbot`.
2. Copiá el token que te da y cargá `TELEGRAM_BOT_TOKEN`.
3. El server hace **long-polling** de `getUpdates` automáticamente — no necesita URL pública.
4. Escribile a tu bot desde Telegram: los mensajes entrantes aparecen en el panel de Mensajería.

#### WhatsApp (Meta Cloud API)

1. Creá una app en [developers.facebook.com](https://developers.facebook.com).
2. Agregá el producto **WhatsApp** y registrá un número (podés usar un número de prueba).
3. Copiá el **token de acceso** en `WHATSAPP_TOKEN` y el **Phone Number ID** en `WHATSAPP_PHONE_ID`.
4. Elegí cualquier string para `WHATSAPP_VERIFY_TOKEN`.
5. En la consola de Meta, configurá el webhook apuntando a `https://<tu-dominio>/api/whatsapp/webhook` con el mismo verify token. **Para probar en localhost** usá un túnel HTTPS (ngrok, cloudflared) hacia `http://localhost:8787`.

#### KITT (copiloto logístico con voz)

KITT es el asistente multimodal del panel: responde por texto y voz (STT/TTS nativos del navegador), analiza el almacén completo y los maestros de productos con códigos NUT que subas en Excel. Usa un proveedor OpenAI-compatible vía el backend:

- **Ollama (local, sin API key)** — levantaló con `ollama serve` y elegí el modelo con `OLLAMA_MODEL` (default `llama3.2`). Es lo que usa por defecto si no hay key.
- **OpenRouter** — cargá `OPENROUTER_API_KEY` y opcionalmente `KITT_MODEL` (default `google/gemini-2.5-flash`, multimodal).

```env
KITT_PROVIDER=auto            # auto | openrouter | ollama
OPENROUTER_API_KEY=
KITT_MODEL=google/gemini-2.5-flash
OLLAMA_MODEL=llama3.2
```

Los archivos Excel (`.xlsx`/`.xls`/`.csv`) se parsean en el navegador, se detectan las columnas NUT y producto, y quedan persistidos en IndexedDB. KITT los usa como contexto junto con un snapshot de todas las colecciones del almacén.

## Estructura

```text
/
├── server/                 # Backend Express + Drizzle/SQLite
│   ├── index.ts            # Rutas del API (algunas con JWT)
│   ├── auth.ts             # Middleware JWT (JWKS de Supabase)
│   ├── db.ts               # Conexión libSQL + queries
│   ├── schema.ts           # Esquema Drizzle (chats, messages, meta)
│   ├── telegram.ts         # Long-polling + envío
│   ├── whatsapp.ts         # Envío + webhook (verificación y recepción)
│   └── events.ts           # Hub SSE
├── scripts/
│   └── seed-supabase.ts    # Seed de usuarios + tabla profiles en Supabase
├── src/
│   ├── components/dashboard/   # Vistas React (isla client:only)
│   ├── data/                   # Stores, schemas de campos, seed, strings
│   ├── hooks/                  # useAuth, useCollections, useMessaging
│   ├── lib/                    # idb, theme, ai, messaging client, utilidades
│   ├── layouts/                # Layout.astro (boot de tema sin FOUC)
│   └── pages/index.astro       # SPA (isla React)
└── package.json
```

## Endpoints del API

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/health` | Estado del server e integraciones |
| GET | `/api/events` | SSE: `message` y `chat` en tiempo real |
| GET | `/api/chats?channel=` | Lista de conversaciones |
| GET | `/api/messages?chatId=&afterId=` | Mensajes (para catch-up) |
| POST | `/api/telegram/send` | Envía un mensaje por Telegram `{ chatId, text }` |
| GET | `/api/telegram/status` | Estado de Telegram |
| POST | `/api/whatsapp/send` | Envía un mensaje por WhatsApp `{ to, text }` |
| GET/POST | `/api/whatsapp/webhook` | Verificación y recepción de Meta |
| GET | `/api/whatsapp/status` | Estado de WhatsApp |
| GET | `/api/kitt/health` | Estado del copiloto (proveedor y modelo) |
| POST | `/api/kitt/chat` | Chat de KITT con streaming SSE (Ollama/OpenRouter) |

> Con `SUPABASE_JWKS_URL` activa, todos los endpoints (salvo `/api/health`, el manifest y el webhook de Meta) exigen `Authorization: Bearer <jwt>`. El SSE acepta el token como `?token=`.
