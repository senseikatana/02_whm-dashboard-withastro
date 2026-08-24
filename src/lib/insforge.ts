import { createClient } from '@insforge/sdk';

const INSFORGE_URL: string | undefined = import.meta.env.PUBLIC_INSFORGE_URL;
const INSFORGE_ANON_KEY: string | undefined = import.meta.env.PUBLIC_INSFORGE_ANON_KEY;

let client: ReturnType<typeof createClient> | null = null;

export function isInsForgeConfigured(): boolean {
	return Boolean(INSFORGE_URL && INSFORGE_ANON_KEY);
}

export function getInsForge(): ReturnType<typeof createClient> {
	if (!client) {
		if (!INSFORGE_URL || !INSFORGE_ANON_KEY) {
			throw new Error(
				'InsForge no está configurado (PUBLIC_INSFORGE_URL / PUBLIC_INSFORGE_ANON_KEY).',
			);
		}
		client = createClient({ baseUrl: INSFORGE_URL, anonKey: INSFORGE_ANON_KEY });
	}
	return client;
}
