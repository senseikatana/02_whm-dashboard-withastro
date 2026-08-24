/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly PUBLIC_AI_ENDPOINT?: string;
	readonly PUBLIC_AI_KEY?: string;
	readonly PUBLIC_AI_MODEL?: string;
	readonly PUBLIC_API_BASE?: string;
	readonly PUBLIC_AUTH_OAUTH_PROVIDERS?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
