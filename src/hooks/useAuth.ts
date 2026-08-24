import { useCallback, useEffect, useState } from 'react';
import { resolveRoleId } from '../auth/roles';
import { getInsForge, isInsForgeConfigured } from '../lib/insforge';
import { DEFAULT_OPERATOR, operatorStore } from '../lib/operator';
import type { Operator, Session } from '../types';

export type AuthMode = 'insforge' | 'demo';

export interface RegisterInput {
	email: string;
	password: string;
	name: string;
	roleId: string;
}

interface UseAuthResult {
	status: 'loading' | 'ready';
	authMode: AuthMode;
	session: Session | null;
	signIn: (operator: Operator) => void;
	signInWithPassword: (email: string, password: string) => Promise<string | null>;
	register: (input: RegisterInput) => Promise<{ error: string | null; needsConfirmation: boolean }>;
	signInWithOAuth: (provider: string) => Promise<string | null>;
	signOut: () => Promise<void>;
}

interface InsForgeUser {
	id: string;
	email?: string | null;
	user_metadata?: Record<string, unknown> | null;
}

interface InsForgeProfile {
	name?: string;
	role_id?: string;
}

async function resolveSession(user: InsForgeUser | null | undefined): Promise<Session | null> {
	if (!user) return null;
	const metadata = (user.user_metadata ?? {}) as { name?: string; role_id?: string };
	let profile: InsForgeProfile | null = null;
	try {
		const { data } = await getInsForge().auth.getProfile(user.id);
		profile = (data?.profile ?? null) as InsForgeProfile | null;
	} catch {
		// sin perfil: se usa el metadata o el fallback
	}
	return {
		uid: user.id,
		name: profile?.name || metadata.name || user.email || 'Usuario',
		roleId: resolveRoleId(profile?.role_id ?? metadata.role_id),
	};
}

export function useAuth(): UseAuthResult {
	const [session, setSession] = useState<Session | null>(null);
	const [status, setStatus] = useState<'loading' | 'ready'>('loading');
	const authMode: AuthMode = isInsForgeConfigured() ? 'insforge' : 'demo';

	useEffect(() => {
		if (!isInsForgeConfigured()) {
			setSession(operatorStore.load() ?? DEFAULT_OPERATOR);
			setStatus('ready');
			return;
		}
		let disposed = false;
		const insforge = getInsForge();
		// Rehidrata la sesión (refresh cookie + insforge_csrf_token).
		void insforge.auth
			.getCurrentUser()
			.then(async ({ data, error }) => {
				if (disposed) return;
				if (error) console.warn('[auth] getCurrentUser:', error.message);
				const next = await resolveSession(data?.user);
				if (disposed) return;
				setSession(next);
				setStatus('ready');
			})
			.catch(() => {
				if (disposed) return;
				setSession(null);
				setStatus('ready');
			});
		return () => {
			disposed = true;
		};
	}, []);

	const signIn = useCallback((operator: Operator) => {
		operatorStore.save(operator);
		setSession({ uid: operator.uid, name: operator.name, roleId: operator.roleId });
		setStatus('ready');
	}, []);

	const signInWithPassword = useCallback(async (email: string, password: string) => {
		const insforge = getInsForge();
		const { data, error } = await insforge.auth.signInWithPassword({ email, password });
		if (error) return error.message;
		setSession(await resolveSession(data?.user));
		return null;
	}, []);

	const register = useCallback(async (input: RegisterInput) => {
		const insforge = getInsForge();
		const { data, error } = await insforge.auth.signUp({
			email: input.email,
			password: input.password,
			name: input.name,
			redirectTo: `${window.location.origin}/login`,
		});
		if (error) return { error: error.message, needsConfirmation: false };
		const needsConfirmation = Boolean(data?.requireEmailVerification);
		if (!needsConfirmation && data?.user) {
			try {
				await insforge.auth.setProfile({ name: input.name, role_id: input.roleId });
			} catch (profileError) {
				console.warn('[auth] setProfile:', profileError);
			}
			setSession(await resolveSession(data.user));
		}
		return { error: null, needsConfirmation };
	}, []);

	const signInWithOAuth = useCallback(async (provider: string) => {
		const insforge = getInsForge();
		const { error } = await insforge.auth.signInWithOAuth(provider, {
			redirectTo: `${window.location.origin}/auth/callback`,
		});
		return error ? error.message : null;
	}, []);

	const signOut = useCallback(async () => {
		if (isInsForgeConfigured()) {
			try {
				await getInsForge().auth.signOut();
			} catch {
				// sesión local: seguimos con el cierre local
			}
		}
		operatorStore.clear();
		setSession(null);
	}, []);

	return { status, authMode, session, signIn, signInWithPassword, register, signInWithOAuth, signOut };
}
