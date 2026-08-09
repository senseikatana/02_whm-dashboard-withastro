import 'dotenv/config';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { ensureSchema, insertMessage, listChats, listMessages, upsertChat } from './db';
import { sseConnect } from './events';
import { kittChat, kittConfigured, kittModel, kittProvider } from './kitt';
import { startTelegramPolling, telegramConfigured, telegramSend } from './telegram';
import {
	ingestWebhook,
	verifyWebhook,
	whatsappConfigured,
	whatsappSend,
} from './whatsapp';

function queryString(value: unknown): string | undefined {
	return typeof value === 'string' ? value : undefined;
}

async function main(): Promise<void> {
	await ensureSchema();

	const app = express();
	const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:4321,http://127.0.0.1:4321')
		.split(',')
		.map((origin) => origin.trim());

	app.use(
		cors({
			origin: (origin, callback) => {
				if (!origin || allowedOrigins.includes(origin)) {
					callback(null, true);
				} else {
					callback(new Error('Origen no permitido por CORS.'));
				}
			},
		}),
	);
	app.use(express.json({ limit: '8mb' }));

	const wrap =
		(handler: (req: Request, res: Response) => Promise<void>) =>
		(req: Request, res: Response, next: NextFunction) => {
			handler(req, res).catch(next);
		};

	app.get('/api/health', (_req, res) => {
		res.json({
			ok: true,
			telegram: telegramConfigured(),
			whatsapp: whatsappConfigured(),
			time: Date.now(),
		});
	});

	app.get('/api/events', (req, res) => {
		res.socket?.setTimeout(0);
		sseConnect(res);
	});

	app.get('/api/chats', async (req, res) => {
		res.json(await listChats(queryString(req.query.channel)));
	});

	app.get(
		'/api/messages',
		wrap(async (req, res) => {
			const chatId = queryString(req.query.chatId);
			if (!chatId) {
				res.status(400).json({ error: 'Falta chatId.' });
				return;
			}
			const afterId = Number(queryString(req.query.afterId) ?? 0);
			res.json(await listMessages(chatId, Number.isNaN(afterId) ? 0 : afterId));
		}),
	);

	app.post(
		'/api/telegram/send',
		wrap(async (req, res) => {
			const chatId = queryString(req.body.chatId);
			const text = queryString(req.body.text);
			if (!chatId || !text) {
				res.status(400).json({ error: 'Faltan chatId o text.' });
				return;
			}
			if (!telegramConfigured()) {
				res.status(400).json({ error: 'Telegram no está configurado.' });
				return;
			}
			await telegramSend(chatId, text);
			const saved = await insertMessage({
				chatId,
				channel: 'telegram',
				direction: 'out',
				text,
				status: 'sent',
			});
			res.json(saved);
		}),
	);

	app.get('/api/telegram/status', (_req, res) => {
		res.json({ configured: telegramConfigured() });
	});

	app.post(
		'/api/whatsapp/send',
		wrap(async (req, res) => {
			const to = queryString(req.body.to);
			const text = queryString(req.body.text);
			if (!to || !text) {
				res.status(400).json({ error: 'Faltan to o text.' });
				return;
			}
			if (!whatsappConfigured()) {
				res.status(400).json({ error: 'WhatsApp no está configurado.' });
				return;
			}
			await whatsappSend(to, text);
			const chat = await upsertChat({
				channel: 'whatsapp',
				externalId: to,
				contactName: null,
				timestamp: Date.now(),
			});
			const saved = await insertMessage({
				chatId: chat.id,
				channel: 'whatsapp',
				direction: 'out',
				text,
				status: 'sent',
			});
			res.json(saved);
		}),
	);

	app.get('/api/whatsapp/status', (_req, res) => {
		res.json({
			configured: whatsappConfigured(),
			phoneId: process.env.WHATSAPP_PHONE_ID ?? null,
		});
	});

	app.get('/api/whatsapp/webhook', (req, res) => {
		const challenge = verifyWebhook(req.query as Record<string, unknown>);
		if (challenge === null) {
			res.status(403).send('Verificación de webhook fallida.');
			return;
		}
		res.send(challenge);
	});

	app.post(
		'/api/whatsapp/webhook',
		wrap(async (req, res) => {
			await ingestWebhook(req.body);
			res.sendStatus(200);
		}),
	);

	app.get('/api/kitt/health', (_req, res) => {
		res.json({
			configured: kittConfigured(),
			provider: kittProvider(),
			model: kittModel(),
		});
	});

	app.post(
		'/api/kitt/chat',
		wrap(async (req, res) => {
			await kittChat(res, req.body);
		}),
	);

	app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
		console.error('[whm-server] error:', error);
		const message = error instanceof Error ? error.message : 'Error interno del servidor.';
		res.status(500).json({ error: message });
	});

	const port = Number(process.env.PORT ?? 8787);
	app.listen(port, () => {
		console.log(`[whm-server] escuchando en http://localhost:${port}`);
	});

	void startTelegramPolling();
}

main().catch((error) => {
	console.error('[whm-server] no pudo iniciar:', error);
	process.exit(1);
});
