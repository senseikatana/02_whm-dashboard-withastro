import { LogOut, Menu, Radio } from 'lucide-react';
import { S } from '../../data/strings';
import type { Session } from '../../types';

interface HeaderProps {
	mode: 'local' | 'firestore';
	session: Session;
	onMenuClick: () => void;
	onSignOut: () => void;
}

export function Header({ mode, session, onMenuClick, onSignOut }: HeaderProps) {
	return (
		<header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={onMenuClick}
					aria-label="Abrir menú"
					className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
				>
					<Menu size={20} />
				</button>
				<span
					className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
						mode === 'firestore'
							? 'bg-emerald-100 text-emerald-700'
							: 'bg-amber-100 text-amber-700'
					}`}
				>
					<Radio size={12} />
					{mode === 'firestore' ? S.modeFirestore : S.modeLocal}
				</span>
			</div>

			<div className="flex items-center gap-3">
				<div className="text-right leading-tight">
					<p className="text-sm font-bold text-gray-900">{session.name}</p>
					<p className="text-xs text-gray-500">{session.role}</p>
				</div>
				<button
					type="button"
					onClick={onSignOut}
					aria-label={S.signOut}
					title={S.signOut}
					className="rounded-lg p-2 text-gray-500 transition hover:bg-rose-50 hover:text-rose-600"
				>
					<LogOut size={18} />
				</button>
			</div>
		</header>
	);
}
