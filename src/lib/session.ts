// Token de sesión para llamadas al backend de mensajería (server/).
// El server valida JWT de Supabase solo si SUPABASE_JWKS_URL está definido;
// en local va abierto. Cuando el backend se migre a InsForge, aquí se
// devolverá el access token de insforge.auth.
export async function getSessionToken(): Promise<string | null> {
	return null;
}
