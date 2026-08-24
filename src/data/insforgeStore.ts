import { idbGet } from '../lib/idb';
import { getInsForge } from '../lib/insforge';
import type { CollectionKey, Doc } from '../types';
import { seedData } from './seed';
import type { AppStore } from './store';

const TABLE = 'wms_docs';
const COLLECTION_STORE = 'collections';

type Listener = (docs: Doc[], error?: string) => void;

export function createInsForgeStore(): AppStore {
	return new InsForgeStore();
}

class InsForgeStore implements AppStore {
	readonly kind = 'remote' as const;

	private readonly listeners = new Map<CollectionKey, Set<Listener>>();
	private readonly cache = new Map<CollectionKey, Doc[]>();
	private ready: Promise<void>;
	private channel: BroadcastChannel | null = null;

	constructor() {
		this.ready = this.init();
	}

	private async init(): Promise<void> {
		for (const col of Object.keys(seedData) as CollectionKey[]) {
			const docs = await this.fetch(col).catch((error) => {
				console.error(`[insforge] fetch ${col} falló:`, error);
				return null;
			});
			if (docs !== null && docs.length > 0) {
				this.cache.set(col, docs);
				continue;
			}
			// La colección está vacía en InsForge: subir el contenido local
			// existente (IndexedDB) o, si no hay, el seed de Esinsa.
			const local = await idbGet<Doc[]>(COLLECTION_STORE, col).catch(() => undefined);
			const rows = local !== undefined && local.length > 0 ? local : this.seed(col);
			if (rows.length > 0) {
				await this.insertMany(col, rows).catch((error) => {
					console.error(`[insforge] seed ${col} falló:`, error);
				});
			}
			this.cache.set(col, rows);
		}

		if (typeof BroadcastChannel !== 'undefined') {
			this.channel = new BroadcastChannel('whm.local');
			this.channel.onmessage = (event: MessageEvent<{ col: CollectionKey }>) => {
				void this.reload(event.data?.col);
			};
		}
	}

	private seed(col: CollectionKey): Doc[] {
		const createdAt = Date.now();
		return (seedData[col] ?? []).map((row) => ({
			id: crypto.randomUUID(),
			...row,
			createdAt,
		}));
	}

	private async fetch(col: CollectionKey): Promise<Doc[]> {
		const insforge = getInsForge();
		const { data, error } = await insforge.database
			.from(TABLE)
			.select('id, data')
			.eq('collection', col)
			.order('created_at', { ascending: true })
			.order('id', { ascending: true });
		if (error) throw new Error(`InsForge select ${col}: ${JSON.stringify(error)}`);
		return ((data ?? []) as { id: string; data: Record<string, unknown> }[]).map((row) => ({
			...row.data,
			id: row.id,
		}));
	}

	private async insertMany(col: CollectionKey, docs: Doc[]): Promise<void> {
		const now = Date.now();
		const insforge = getInsForge();
		const { error } = await insforge.database
			.from(TABLE)
			.insert(
				docs.map((doc) => ({
					collection: col,
					id: doc.id,
					data: doc,
					created_at: now,
					updated_at: now,
				})),
			);
		if (error) throw new Error(`InsForge insert ${col}: ${JSON.stringify(error)}`);
	}

	private async reload(col: CollectionKey): Promise<void> {
		if (col === undefined) return;
		try {
			const docs = await this.fetch(col);
			this.cache.set(col, docs);
			this.notify(col);
		} catch (error) {
			this.listeners.get(col)?.forEach((cb) => cb([], this.errorMessage(error)));
		}
	}

	private errorMessage(error: unknown): string {
		return error instanceof Error ? error.message : 'Error al contactar con InsForge.';
	}

	private notify(col: CollectionKey): void {
		const docs = this.cache.get(col) ?? [];
		this.listeners.get(col)?.forEach((cb) => cb(docs));
		this.channel?.postMessage({ col });
	}

	subscribeCollection(col: CollectionKey, cb: Listener): () => void {
		const set = this.listeners.get(col) ?? new Set();
		set.add(cb);
		this.listeners.set(col, set);
		void this.ready.then(() => cb(this.cache.get(col) ?? []));
		return () => {
			set.delete(cb);
		};
	}

	async create(col: CollectionKey, data: Record<string, unknown>): Promise<string> {
		await this.ready;
		const doc: Doc = { id: crypto.randomUUID(), ...data, createdAt: Date.now() };
		await this.insertMany(col, [doc]);
		this.cache.set(col, [...(this.cache.get(col) ?? []), doc]);
		this.notify(col);
		return doc.id;
	}

	async createMany(col: CollectionKey, items: Record<string, unknown>[]): Promise<void> {
		if (items.length === 0) return;
		await this.ready;
		const createdAt = Date.now();
		const docs: Doc[] = items.map((item) => ({ id: crypto.randomUUID(), ...item, createdAt }));
		await this.insertMany(col, docs);
		this.cache.set(col, [...(this.cache.get(col) ?? []), ...docs]);
		this.notify(col);
	}

	async update(col: CollectionKey, id: string, data: Record<string, unknown>): Promise<void> {
		await this.ready;
		const current = (this.cache.get(col) ?? []).find((doc) => doc.id === id);
		const next: Doc = { ...current, ...data, id };
		const insforge = getInsForge();
		const { error } = await insforge.database
			.from(TABLE)
			.update({ data: next, updated_at: Date.now() })
			.eq('collection', col)
			.eq('id', id);
		if (error) throw new Error(`InsForge update ${col}: ${JSON.stringify(error)}`);
		this.cache.set(
			col,
			(this.cache.get(col) ?? []).map((doc) => (doc.id === id ? next : doc)),
		);
		this.notify(col);
	}

	async remove(col: CollectionKey, id: string): Promise<void> {
		await this.ready;
		const insforge = getInsForge();
		const { error } = await insforge.database
			.from(TABLE)
			.delete()
			.eq('collection', col)
			.eq('id', id);
		if (error) throw new Error(`InsForge delete ${col}: ${JSON.stringify(error)}`);
		this.cache.set(
			col,
			(this.cache.get(col) ?? []).filter((doc) => doc.id !== id),
		);
		this.notify(col);
	}

	async batchDelete(col: CollectionKey, ids: string[]): Promise<void> {
		await this.ready;
		const insforge = getInsForge();
		for (const id of ids) {
			const { error } = await insforge.database
				.from(TABLE)
				.delete()
				.eq('collection', col)
				.eq('id', id);
			if (error) throw new Error(`InsForge delete ${col}: ${JSON.stringify(error)}`);
		}
		const toDelete = new Set(ids);
		this.cache.set(
			col,
			(this.cache.get(col) ?? []).filter((doc) => !toDelete.has(doc.id)),
		);
		this.notify(col);
	}
}
