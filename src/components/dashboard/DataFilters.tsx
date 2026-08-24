import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Filter, Search, X } from 'lucide-react';
import type { FilterState } from '../../hooks/useFilters';
import { useI18n } from '../../i18n/LocaleProvider';
import type { FieldDef } from '../../types';

interface DataFiltersProps {
	fields: readonly FieldDef[];
	filters: FilterState;
	activeCount: number;
	onQuery: (value: string) => void;
	onSelect: (key: string, value: string) => void;
	onNumber: (key: string, part: 'min' | 'max', value: string) => void;
	onClear: () => void;
}

interface Chip {
	key: string;
	label: string;
	onRemove: () => void;
}

const SELECT_BASE =
	'w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100';

const NUMBER_BASE =
	'w-20 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100';

export function DataFilters({
	fields,
	filters,
	activeCount,
	onQuery,
	onSelect,
	onNumber,
	onClear,
}: DataFiltersProps) {
	const { S } = useI18n();
	const [open, setOpen] = useState(false);
	const toolbarRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const onPointerDown = (event: PointerEvent) => {
			if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener('pointerdown', onPointerDown);
		return () => document.removeEventListener('pointerdown', onPointerDown);
	}, [open]);

	const labelOf = (field: FieldDef): string => S.fieldLabels[field.key] ?? field.label;
	const selectFields = fields.filter((field) => field.type === 'select');
	const numberFields = fields.filter((field) => field.type === 'number');

	const clearNumber = (key: string) => {
		onNumber(key, 'min', '');
		onNumber(key, 'max', '');
	};

	const chips: Chip[] = [];
	if (filters.query.trim()) {
		chips.push({
			key: 'query',
			label: `${S.search}: ${filters.query.trim()}`,
			onRemove: () => onQuery(''),
		});
	}
	for (const field of selectFields) {
		const value = filters.selects[field.key];
		if (value) {
			chips.push({
				key: `s-${field.key}`,
				label: `${labelOf(field)}: ${value}`,
				onRemove: () => onSelect(field.key, ''),
			});
		}
	}
	for (const field of numberFields) {
		const range = filters.numbers[field.key];
		const min = range?.min;
		const max = range?.max;
		if (!min && !max) continue;
		const text = min && max ? `${min} – ${max}` : min ? `≥ ${min}` : `≤ ${max}`;
		chips.push({
			key: `n-${field.key}`,
			label: `${labelOf(field)} ${text}`,
			onRemove: () => clearNumber(field.key),
		});
	}

	return (
		<div ref={toolbarRef} className="relative border-b border-gray-200 px-4 py-2 dark:border-slate-800">
			<div className="flex flex-wrap items-center gap-2">
				<div className="relative">
					<Search
						size={14}
						className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
					/>
					<input
						type="search"
						value={filters.query}
						onChange={(event) => onQuery(event.target.value)}
						placeholder={S.search}
						aria-label={S.search}
						className="w-52 max-w-full rounded-md border border-transparent bg-gray-100/80 py-1.5 pl-8 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white dark:bg-slate-800/60 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:bg-slate-800"
					/>
				</div>

				<button
					type="button"
					onClick={() => setOpen((prev) => !prev)}
					aria-expanded={open}
					aria-haspopup="dialog"
					className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition ${
						open || activeCount > 0
							? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
							: 'text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800'
					}`}
				>
					<Filter size={14} />
					{S.filters}
					{activeCount > 0 && (
						<span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
							{activeCount}
						</span>
					)}
					<ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
				</button>

				{chips.map((chip) => (
					<span
						key={chip.key}
						className="flex items-center gap-1 rounded-full bg-gray-100 py-1 pl-2.5 pr-1 text-xs font-medium text-gray-700 dark:bg-slate-800 dark:text-slate-300"
					>
						{chip.label}
						<button
							type="button"
							onClick={chip.onRemove}
							aria-label={`${S.clearFilters}: ${chip.label}`}
							className="rounded-full p-0.5 text-gray-400 transition hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-slate-700 dark:hover:text-slate-100"
						>
							<X size={12} />
						</button>
					</span>
				))}
			</div>

			{open && (
				<div
					role="dialog"
					aria-label={S.filters}
					className="absolute left-4 top-full z-30 mt-1 w-[min(320px,calc(100vw-2rem))] rounded-lg border border-gray-200 bg-white p-3 shadow-xl animate-fade-in-up dark:border-slate-700 dark:bg-slate-900"
				>
					<div className="mb-2 flex items-center justify-between px-0.5">
						<span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
							{S.filters}
						</span>
						{activeCount > 0 && (
							<button
								type="button"
								onClick={onClear}
								className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
							>
								<X size={12} />
								{S.clearFilters}
							</button>
						)}
					</div>

					<div className="space-y-3">
						{selectFields.map((field) => (
							<div key={field.key}>
								<label className="mb-1 block text-xs font-medium text-gray-500 dark:text-slate-400">
									{labelOf(field)}
								</label>
								<select
									value={filters.selects[field.key] ?? ''}
									onChange={(event) => onSelect(field.key, event.target.value)}
									aria-label={labelOf(field)}
									className={SELECT_BASE}
								>
									<option value="">{S.all}</option>
									{field.options?.map((option) => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</select>
							</div>
						))}

						{numberFields.map((field) => (
							<div key={field.key}>
								<label className="mb-1 block text-xs font-medium text-gray-500 dark:text-slate-400">
									{labelOf(field)}
								</label>
								<div className="flex items-center gap-1.5">
									<input
										type="number"
										value={filters.numbers[field.key]?.min ?? ''}
										onChange={(event) => onNumber(field.key, 'min', event.target.value)}
										placeholder={S.min}
										aria-label={`${labelOf(field)} ${S.min}`}
										className={NUMBER_BASE}
									/>
									<span className="text-gray-400 dark:text-slate-500">–</span>
									<input
										type="number"
										value={filters.numbers[field.key]?.max ?? ''}
										onChange={(event) => onNumber(field.key, 'max', event.target.value)}
										placeholder={S.max}
										aria-label={`${labelOf(field)} ${S.max}`}
										className={NUMBER_BASE}
									/>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
