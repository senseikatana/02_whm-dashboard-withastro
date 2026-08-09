import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_OPERATOR, operatorStore } from '../lib/operator';
import type { Operator, Session } from '../types';

interface UseAuthResult {
	status: 'loading' | 'ready';
	session: Session | null;
	signIn: (operator: Operator) => void;
	signOut: () => void;
}

export function useAuth(): UseAuthResult {
	const [session, setSession] = useState<Session | null>(null);
	const [status, setStatus] = useState<'loading' | 'ready'>('loading');

	useEffect(() => {
		setSession(operatorStore.load() ?? DEFAULT_OPERATOR);
		setStatus('ready');
	}, []);

	const signIn = useCallback((operator: Operator) => {
		operatorStore.save(operator);
		setSession({ uid: operator.uid, name: operator.name, role: operator.role });
		setStatus('ready');
	}, []);

	const signOut = useCallback(() => {
		operatorStore.clear();
		setSession(null);
	}, []);

	return { status, session, signIn, signOut };
}
