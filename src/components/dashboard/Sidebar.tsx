import { X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { S } from '../../data/strings';
import type { ViewKey } from '../../types';

export interface NavItem {
	key: ViewKey;
	label: string;
	icon: LucideIcon;
}

interface SidebarProps {
	items: NavItem[];
	active: ViewKey;
	onNavigate: (view: ViewKey) => void;
	open: boolean;
	onClose: () => void;
}

export function Sidebar({ items, active, onNavigate, open, onClose }: SidebarProps) {
	return (
		<>
			{open && (
				<div
					className="fixed inset-0 z-40 bg-gray-900/60 md:hidden"
					onClick={onClose}
					aria-hidden="true"
				/>
			)}
			<aside
				className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col bg-[#0F172A] transition-transform md:static md:translate-x-0 ${
					open ? 'translate-x-0' : '-translate-x-full'
				}`}
			>
				<div className="flex items-center justify-between p-6">
					<div>
						<h1 className="text-lg font-extrabold text-white">{S.appName}</h1>
						<p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
							{S.tagline}
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						aria-label="Cerrar menú"
						className="rounded-lg p-1 text-gray-400 hover:text-white md:hidden"
					>
						<X size={24} />
					</button>
				</div>

				<nav className="flex-1 overflow-y-auto px-4 pb-6">
					{items.map(({ key, label, icon: Icon }) => {
						const isActive = active === key;
						return (
							<button
								key={key}
								type="button"
								onClick={() => onNavigate(key)}
								aria-current={isActive ? 'page' : undefined}
								className={`mb-1 flex w-full items-center rounded-lg px-4 py-2.5 text-left transition-all ${
									isActive
										? 'bg-indigo-600 text-white shadow-md'
										: 'text-gray-400 hover:bg-gray-800 hover:text-white'
								}`}
							>
								<Icon size={18} className={`mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
								<span className="text-sm font-medium">{label}</span>
							</button>
						);
					})}
				</nav>
			</aside>
		</>
	);
}
