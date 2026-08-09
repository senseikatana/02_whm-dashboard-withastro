import { useState } from 'react';
import { ArrowRight, Boxes, Loader2, ShieldCheck } from 'lucide-react';
import { S } from '../../data/strings';
import type { Doc, Operator } from '../../types';

interface LoginScreenProps {
	operators: Doc[];
	loading: boolean;
	onSelect: (operator: Operator) => void;
}

const DEMO_OPERATOR: Doc = { id: 'demo', name: 'Demo', role: 'Admin' };

export function LoginScreen({ operators, loading, onSelect }: LoginScreenProps) {
	const [selected, setSelected] = useState<string | null>(null);

	const list = operators.length > 0 ? operators : [DEMO_OPERATOR];
	const effectiveSelected = selected ?? list[0]?.id;

	const confirm = () => {
		const chosen = list.find((op) => op.id === effectiveSelected) ?? list[0];
		onSelect({
			uid: chosen.id,
			name: String(chosen.name ?? DEMO_OPERATOR.name),
			role: String(chosen.role ?? DEMO_OPERATOR.role),
		});
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
			<div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-fade-in-down">
				<div className="mb-8 flex items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
						<Boxes size={24} />
					</div>
					<div>
						<h1 className="text-xl font-extrabold text-gray-900">{S.appName}</h1>
						<p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
							{S.tagline}
						</p>
					</div>
				</div>

				<h2 className="text-2xl font-extrabold text-gray-900">{S.loginTitle}</h2>
				<p className="mb-6 mt-1 text-sm text-gray-500">{S.loginSubtitle}</p>

				<div className="mb-6 space-y-2">
					{loading && (
						<div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-500">
							<Loader2 size={16} className="animate-spin" />
							{S.bootMessage}
						</div>
					)}

					{!loading &&
						list.map((op) => {
							const isSelected = effectiveSelected === op.id;
							return (
								<button
									key={op.id}
									type="button"
									onClick={() => setSelected(op.id)}
									className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
										isSelected
											? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100'
											: 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
									}`}
								>
									<span className="text-sm font-bold text-gray-900">{String(op.name)}</span>
									<span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-gray-600">
										{String(op.role)}
									</span>
								</button>
							);
						})}
				</div>

				<button
					type="button"
					onClick={confirm}
					disabled={!effectiveSelected}
					className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
				>
					{S.startShift}
					<ArrowRight size={18} />
				</button>

				<p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[11px] text-gray-400">
					<ShieldCheck size={14} />
					{S.loginDemo}
				</p>
			</div>
		</div>
	);
}
