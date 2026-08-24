const AI_ENDPOINT = import.meta.env.PUBLIC_AI_ENDPOINT;
const AI_KEY = import.meta.env.PUBLIC_AI_KEY;
const AI_MODEL = import.meta.env.PUBLIC_AI_MODEL ?? 'mimo-v2.5';

const SYSTEM_PROMPT =
	'Sos el asistente de almacén de Esinsa Gaskets (Tarragona): juntas de estanqueidad, espárragos, tornillería industrial, planchas de acero, inox y cobre. Respondé en español, breve y con datos concretos. Si te piden un registro en JSON, devolvé ÚNICAMENTE el JSON válido.';

interface AiResponse {
	text?: unknown;
	content?: unknown;
	choices?: Array<{ message?: { content?: unknown } }>;
}

function chatUrl(endpoint: string): string {
	const base = endpoint.replace(/\/+$/, '');
	return base.endsWith('/chat/completions') ? base : `${base}/chat/completions`;
}

export const ai = {
	isConfigured(): boolean {
		return Boolean(AI_ENDPOINT);
	},
	async generate(prompt: string): Promise<string> {
		if (!AI_ENDPOINT) throw new Error('AI_NOT_CONFIGURED');

		const headers: Record<string, string> = { 'Content-Type': 'application/json' };
		if (AI_KEY) headers.Authorization = `Bearer ${AI_KEY}`;

		const response = await fetch(chatUrl(AI_ENDPOINT), {
			method: 'POST',
			headers,
			body: JSON.stringify({
				model: AI_MODEL,
				messages: [
					{ role: 'system', content: SYSTEM_PROMPT },
					{ role: 'user', content: prompt },
				],
				temperature: 0.3,
			}),
		});
		if (!response.ok) {
			throw new Error(`Error del asistente de IA (${response.status}).`);
		}

		const data = (await response.json()) as AiResponse;
		const text =
			typeof data.text === 'string'
				? data.text
				: typeof data.content === 'string'
					? data.content
					: data.choices?.[0]?.message?.content;

		if (typeof text !== 'string' || text.length === 0) {
			throw new Error('El asistente de IA no devolvió una respuesta válida.');
		}
		return text;
	},
};
