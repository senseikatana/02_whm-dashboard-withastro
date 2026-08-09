import { getStatusTone } from '../../lib/status';
import type { StatusTone } from '../../types';

const TONE_CLASSES: Record<StatusTone, string> = {
	green: 'bg-emerald-100 text-emerald-800 border-emerald-200',
	orange: 'bg-amber-100 text-amber-800 border-amber-200',
	red: 'bg-rose-100 text-rose-800 border-rose-200',
	gray: 'bg-gray-100 text-gray-800 border-gray-200',
};

export function StatusBadge({ status }: { status: string }) {
	return (
		<span
			className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TONE_CLASSES[getStatusTone(status)]}`}
		>
			{status}
		</span>
	);
}
