/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly PUBLIC_FIREBASE_API_KEY?: string;
	readonly PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
	readonly PUBLIC_FIREBASE_PROJECT_ID?: string;
	readonly PUBLIC_FIREBASE_APP_ID?: string;
	readonly PUBLIC_AI_ENDPOINT?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
