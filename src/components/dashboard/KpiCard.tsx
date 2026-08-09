import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	icon: LucideIcon;
	tone?: 'default' | 'danger' | 'success';
}

const TONE_STYLES = {
	default: { card: 'bg-white border-gray-200', icon: 'bg-indigo-50 text-indigo-600', value: 'text-gray-900' },
	danger: { card: 'bg-rose-50 border-rose-100', icon: 'bg-rose-100 text-rose-600', value: 'text-rose-900' },
	success: { card: 'bg-emerald-50 border-emerald-100', icon: 'bg-emerald-100 text-emerald-600', value: 'text-emerald-900' },
} as const;

export function KpiCard({ title, value, subtitle, icon: Icon, tone = 'default' }: KpiCardProps) {
	const styles = TONE_STYLES[tone];
	return (
		<div className={`rounded-xl border p-5 transition-all hover:shadow-md ${styles.card}`}>
			<div className={`mb-4 inline-flex rounded-lg p-2.5 ${styles.icon}`}>
				<Icon size={20} />
			</div>
			<h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-500">{title}</h3>
			<div className={`text-3xl font-extrabold tracking-tight ${styles.value}`}>{value}</div>
			{subtitle && <p className="mt-1 text-sm font-medium text-gray-500">{subtitle}</p>}
		</div>
	);
}
