import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCollections } from '../../hooks/useCollections';
import { useRoles } from '../../hooks/useRoles';
import { LocaleProvider } from '../../i18n/LocaleProvider';
import { ThemeProvider } from '../../lib/theme';
import { LoginScreen } from './LoginScreen';
import { ToastProvider } from './Toast';

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
	return (
		<LocaleProvider>
			<ThemeProvider>
				<ToastProvider>
					<AuthInner mode={mode} />
				</ToastProvider>
			</ThemeProvider>
		</LocaleProvider>
	);
}

function AuthInner({ mode }: { mode: 'login' | 'register' }) {
	const { status, authMode, session, signIn, signInWithPassword, register, signInWithOAuth } = useAuth();
	const collections = useCollections(true);
	const { roles } = useRoles();

	useEffect(() => {
		if (session) window.location.replace('/');
	}, [session]);

	return (
		<LoginScreen
			initialMode={mode}
			operators={collections.users.docs}
			roles={roles}
			loading={status === 'loading' || collections.users.loading}
			authMode={authMode}
			onSelect={signIn}
			onSignInWithPassword={signInWithPassword}
			onRegister={register}
			onSignInWithOAuth={signInWithOAuth}
		/>
	);
}
