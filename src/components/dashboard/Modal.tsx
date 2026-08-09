import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
	title: string;
	onClose: () => void;
	children: ReactNode;
	footer?: ReactNode;
}

export function Modal({ title, onClose, children, footer }: ModalProps) {
	const dialogRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const previous = document.activeElement as HTMLElement | null;
		dialogRef.current?.focus();

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose();
		};

		document.addEventListener('keydown', onKeyDown);
		document.body.style.overflow = 'hidden';

		return () => {
			document.removeEventListener('keydown', onKeyDown);
			document.body.style.overflow = '';
			previous?.focus();
		};
	}, [onClose]);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-fade-in">
			<div
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-label={title}
				tabIndex={-1}
				className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl outline-none animate-fade-in-down"
			>
				<div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-4">
					<h3 className="text-lg font-bold text-gray-900">{title}</h3>
					<button
						type="button"
						onClick={onClose}
						aria-label="Cerrar"
						className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-200 hover:text-gray-700"
					>
						<X size={20} />
					</button>
				</div>
				<div className="flex-1 overflow-y-auto p-6">{children}</div>
				{footer && (
					<div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4">
						{footer}
					</div>
				)}
			</div>
		</div>
	);
}
