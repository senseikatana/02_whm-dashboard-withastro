import { useCallback, useEffect, useState } from 'react';
import {
	onAuthStateChanged,
	signInAnonymously,
	signOut as firebaseSignOut,
} from 'firebase/auth';
import { getStore } from '../data/store';
import { getFirebase } from '../lib/firebase';
import { DEFAULT_OPERATOR, operatorStore } from '../lib/operator';
import { sessionState } from '../lib/session';
import type { Operator, Session } from '../types';

interface UseAuthResult {
	status: 'loading' | 'ready';
	session: Session | null;
	signIn: (operator: Operator) => void;
	signOut: () => void;
}

export function useAuth(): UseAuthResult {
	const store = getStore();
	const [session, setSession] = useState<Session | null>(null);
	const [status, setStatus] = useState<'loading' | 'ready'>('loading');

	useEffect(() => {
		if (store.kind === 'local') {
			setSession(operatorStore.load() ?? DEFAULT_OPERATOR);
			setStatus('ready');
			return;
		}

		const firebase = getFirebase();
		if (!firebase) {
			setStatus('ready');
			return;
		}

		const unsubscribe = onAuthStateChanged(firebase.auth, (user) => {
			if (user) {
				sessionState.setUid(user.uid);
				const operator = operatorStore.load() ?? DEFAULT_OPERATOR;
				setSession({ uid: user.uid, name: operator.name, role: operator.role });
				setStatus('ready');
			} else {
				void signInAnonymously(firebase.auth).catch((error: unknown) => {
					console.error('Fallo el sign-in anónimo:', error);
					setStatus('ready');
				});
			}
		});
		return unsubscribe;
	}, [store]);

	const signIn = useCallback(
		(operator: Operator) => {
			operatorStore.save(operator);
			if (store.kind === 'firestore') {
				const firebase = getFirebase();
				const user = firebase?.auth.currentUser;
				if (firebase && user) {
					sessionState.setUid(user.uid);
					setSession({ uid: user.uid, name: operator.name, role: operator.role });
				}
			} else {
				setSession({ uid: operator.uid, name: operator.name, role: operator.role });
			}
			setStatus('ready');
		},
		[store],
	);

	const signOut = useCallback(() => {
		operatorStore.clear();
		sessionState.setUid(null);
		setSession(null);
		if (store.kind === 'firestore') {
			const firebase = getFirebase();
			if (firebase) void firebaseSignOut(firebase.auth);
		}
	}, [store]);

	return { status, session, signIn, signOut };
}
