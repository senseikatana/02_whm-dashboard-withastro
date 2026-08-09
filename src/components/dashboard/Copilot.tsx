import { useState, type SyntheticEvent } from 'react';
import { Bot, MessageSquare, Send, X } from 'lucide-react';
import { S } from '../../data/strings';
import { ai } from '../../lib/ai';
import { useToast } from './Toast';

interface ChatMessage {
	role: 'user' | 'model';
	text: string;
}

export function Copilot({ inventoryCount }: { inventoryCount: number }) {
	const toast = useToast();
	const [open, setOpen] = useState(false);
	const [input, setInput] = useState('');
	const [busy, setBusy] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([
		{ role: 'model', text: S.copilotWelcome },
	]);

	const send = async (event: SyntheticEvent) => {
		event.preventDefault();
		const text = input.trim();
		if (!text || busy) return;

		setInput('');
		setMessages((prev) => [...prev, { role: 'user', text }]);

		if (!ai.isConfigured()) {
			setMessages((prev) => [...prev, { role: 'model', text: S.aiNotConfigured }]);
			return;
		}

		setBusy(true);
		try {
			const answer = await ai.generate(
				`Contexto: almacén con ${inventoryCount} SKUs. Pregunta del operador: ${text}`,
			);
			setMessages((prev) => [...prev, { role: 'model', text: answer }]);
		} catch {
			toast(S.aiNotConfigured, 'info');
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
			{open && (
				<div className="mb-4 flex h-[420px] w-80 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-fade-in-down sm:w-96">
					<div className="flex items-center justify-between bg-indigo-900 px-4 py-3 text-white">
						<span className="flex items-center font-bold">
							<Bot size={18} className="mr-2" />
							{S.copilotTitle}
						</span>
						<button
							type="button"
							onClick={() => setOpen(false)}
							aria-label="Cerrar copilot"
							className="rounded p-1 transition hover:bg-indigo-800"
						>
							<X size={18} />
						</button>
					</div>

					<div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4">
						{messages.map((message, index) => (
							<div
								key={index}
								className={`w-4/5 rounded-xl p-3 text-sm ${
									message.role === 'user'
										? 'ml-auto bg-indigo-600 text-white'
										: 'border border-gray-200 bg-white text-gray-800 shadow-sm'
								}`}
							>
								{message.text}
							</div>
						))}
						{busy && (
							<div className="w-4/5 rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-400 shadow-sm">
								Analizando...
							</div>
						)}
					</div>

					<form onSubmit={send} className="flex items-end gap-2 border-t border-gray-200 bg-white p-3">
						<textarea
							value={input}
							onChange={(event) => setInput(event.target.value)}
							placeholder={S.copilotPlaceholder}
							rows={1}
							className="max-h-24 flex-1 resize-none rounded-lg border border-gray-300 p-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
						/>
						<button
							type="submit"
							disabled={busy || !input.trim()}
							aria-label="Enviar"
							className="rounded-lg bg-indigo-600 p-2.5 text-white transition hover:bg-indigo-700 disabled:opacity-50"
						>
							<Send size={16} />
						</button>
					</form>
				</div>
			)}

			<button
				type="button"
				onClick={() => setOpen((value) => !value)}
				aria-label={S.copilotTitle}
				className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl transition hover:bg-indigo-700"
			>
				<MessageSquare size={24} />
			</button>
		</div>
	);
}
