import { useEffect } from 'react';
import { useI18n, LocaleProvider } from '../../i18n/LocaleProvider';
import { getInsForge, isInsForgeConfigured } from '../../lib/insforge';

function CallbackInner() {
	const { S } = useI18n();

	useEffect(() => {
		if (!isInsForgeConfigured()) {
			window.location.replace('/login');
			return;
		}
		// El SDK detecta `?insforge_code=` en la URL, lo intercambia por
		// sesión automáticamente y limpia la URL.
		const insforge = getInsForge();
		void insforge.auth
			.getCurrentUser()
			.then(({ data, error }) => {
				window.location.replace(error || !data?.user ? '/login' : '/');
			})
			.catch(() => window.location.replace('/login'));
	}, [S]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-950">
			<div className="flex flex-col items-center gap-3 text-white">
				<div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-indigo-500" />
				<p className="text-sm text-slate-400">{S.bootMessage}</p>
			</div>
		</div>
	);
}

export default function AuthCallback() {
	return (
		<LocaleProvider>
			<CallbackInner />
		</LocaleProvider>
	);
}
