import { useCallback, useEffect, useRef, useState } from 'react';
import type { CollectionsState } from './useCollections';
import { useToast } from '../components/dashboard/Toast';
import { useI18n } from '../i18n/LocaleProvider';
import { kittHealth, kittStream, type KittMessage } from '../lib/kit';
import { cancelSpeech, LOCALE_TO_LANG, primeVoices, speak, startRecognition, ttsSupported, voiceSupported } from '../lib/voice';
import { buildWarehouseSnapshot } from '../lib/warehouse';

export interface KittChatMessage {
	role: 'user' | 'assistant';
	text: string;
}

export interface KittModelStatus {
	configured: boolean;
	provider: 'openrouter' | 'ollama';
	model: string | null;
}

const MUTE_KEY = 'kitt.muted';
const HISTORY_LIMIT = 12;

export function useKitt(collections: CollectionsState) {
	const { S, locale } = useI18n();
	const toast = useToast();
	const [messages, setMessages] = useState<KittChatMessage[]>([]);
	const [input, setInput] = useState('');
	const [busy, setBusy] = useState(false);
	const [listening, setListening] = useState(false);
	const [speaking, setSpeaking] = useState(false);
	const [muted, setMuted] = useState(() => localStorage.getItem(MUTE_KEY) === '1');
	const [model, setModel] = useState<KittModelStatus | null>(null);

	const stopRecognition = useRef<(() => void) | null>(null);
	const finalTranscript = useRef('');

	useEffect(() => {
		primeVoices();
		let cancelled = false;
		void kittHealth().then((health) => {
			if (!cancelled) setModel(health);
		});
		return () => {
			cancelled = true;
			stopRecognition.current?.();
		};
	}, []);

	useEffect(() => {
		localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
	}, [muted]);

	const appendAssistant = (text: string) => {
		setMessages((prev) => {
			if (prev.length === 0 || prev[prev.length - 1].role !== 'assistant') {
				return [...prev, { role: 'assistant', text }];
			}
			const previous = prev[prev.length - 1];
			return [...prev.slice(0, -1), { role: 'assistant', text: previous.text + text }];
		});
	};

	const send = useCallback(
		async (raw: string) => {
			const text = raw.trim();
			if (!text || busy) return;

			cancelSpeech();
			setInput('');
			setMessages((prev) => [...prev, { role: 'user', text }]);
			setBusy(true);

			try {
				const toKitt = (message: KittChatMessage): KittMessage => ({
					role: message.role,
					text: message.text,
				});
				const history: KittMessage[] = [
					...messages.map(toKitt),
					{ role: 'user' as const, text },
				].slice(-HISTORY_LIMIT);

				const snapshot = buildWarehouseSnapshot(collections);
				let full = '';

				for await (const delta of kittStream(history, { snapshot })) {
					full += delta;
					appendAssistant(delta);
				}

				if (full.trim() && !muted && ttsSupported()) {
					setSpeaking(true);
					speak(full, {
						onEnd: () => setSpeaking(false),
						lang: LOCALE_TO_LANG[locale] ?? 'es-AR',
					});
				}
			} catch {
				toast(S.kittError, 'error');
			} finally {
				setBusy(false);
			}
		},
		[busy, collections, messages, muted, S, locale, toast],
	);

	const toggleListen = () => {
		if (listening) {
			stopRecognition.current?.();
			stopRecognition.current = null;
			setListening(false);
			return;
		}
		if (!voiceSupported()) {
			toast(S.kittMicUnsupported, 'info');
			return;
		}
		cancelSpeech();
		finalTranscript.current = '';
		setListening(true);
		stopRecognition.current = startRecognition({
			onInterim: (partial) => setInput(partial),
			onFinal: (partial) => {
				finalTranscript.current = partial;
			},
			onStop: () => {
				setListening(false);
				stopRecognition.current = null;
				const transcript = finalTranscript.current;
				finalTranscript.current = '';
				if (transcript.trim()) void send(transcript);
			},
		});
	};

	const toggleMute = () => setMuted((value) => !value);

	return {
		messages,
		input,
		setInput,
		busy,
		listening,
		speaking,
		muted,
		model,
		send,
		toggleListen,
		toggleMute,
	};
}
