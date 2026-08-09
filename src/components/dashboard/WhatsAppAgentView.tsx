import { useState } from 'react';
import { Bot, MessageCircle, QrCode, Save } from 'lucide-react';
import { S } from '../../data/strings';
import { useToast } from './Toast';

type ConnectionState = 'disconnected' | 'waiting_qr' | 'connected';

const PROMPT_KEY = 'whm.whatsappPrompt';
const DEFAULT_PROMPT =
	'Eres el agente de atención al cliente del almacén. Ayudás a los clientes con el estado de sus pedidos.';

export function WhatsAppAgentView() {
	const toast = useToast();
	const [connection, setConnection] = useState<ConnectionState>('disconnected');
	const [prompt, setPrompt] = useState(() => localStorage.getItem(PROMPT_KEY) ?? DEFAULT_PROMPT);

	const savePrompt = () => {
		localStorage.setItem(PROMPT_KEY, prompt);
		toast(S.saved, 'success');
	};

	return (
		<div className="flex h-full animate-fade-in flex-col gap-6 md:flex-row">
			<div className="flex w-full flex-col items-center rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm md:w-1/3">
				<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
					<MessageCircle size={32} />
				</div>
				<h2 className="text-lg font-bold text-gray-900">{S.whatsappTitle}</h2>
				<p className="mb-6 mt-1 text-sm text-gray-500">{S.whatsappSubtitle}</p>

				<div
					className={`mb-6 flex w-full items-center justify-center rounded-lg py-2.5 text-sm font-bold ${
						connection === 'connected'
							? 'bg-emerald-100 text-emerald-700'
							: 'bg-gray-100 text-gray-600'
					}`}
				>
					<span
						className={`mr-2 h-2 w-2 rounded-full ${
							connection === 'connected' ? 'bg-emerald-500' : 'bg-gray-400'
						}`}
					/>
					{connection === 'connected' ? S.whatsappConnected : S.whatsappDisconnected}
				</div>

				{connection === 'waiting_qr' ? (
					<div className="flex w-full flex-col items-center">
						<div className="flex h-40 w-40 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
							<QrCode size={64} className="text-gray-400" />
						</div>
						<button
							type="button"
							onClick={() => setConnection('connected')}
							className="mt-4 text-sm font-bold text-indigo-600 hover:underline"
						>
							{S.whatsappSimulate}
						</button>
					</div>
				) : (
					<button
						type="button"
						onClick={() => setConnection('waiting_qr')}
						className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-white transition hover:bg-emerald-600"
					>
						{S.whatsappConnect}
					</button>
				)}

				<p className="mt-6 rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-700">
					{S.whatsappDemoNote}
				</p>
			</div>

			<div className="flex w-full flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:w-2/3">
				<h3 className="flex items-center text-lg font-bold text-gray-900">
					<Bot className="mr-2 text-indigo-600" />
					{S.systemPrompt}
				</h3>
				<textarea
					value={prompt}
					onChange={(event) => setPrompt(event.target.value)}
					className="mt-4 min-h-[200px] flex-1 resize-none rounded-lg border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
				/>
				<div className="mt-4 flex justify-end">
					<button
						type="button"
						onClick={savePrompt}
						className="flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
					>
						<Save size={15} />
						{S.systemPromptSave}
					</button>
				</div>
			</div>
		</div>
	);
}
