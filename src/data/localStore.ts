import type { CollectionKey, Doc } from '../types';
import { seedData } from './seed';
import type { AppStore } from './store';

const PREFIX = 'whm.local.';

export function createLocalStore(): AppStore {
	return new LocalStore();
}

class LocalStore implements AppStore {
	readonly kind = 'local' as const;

	private readonly listeners = new Map<CollectionKey, Set<(docs: Doc[]) => void>>();

	constructor() {
		this.seedIfNeeded();
		if (typeof window !== 'undefined') {
			window.addEventListener('storage', this.onStorage);
		}
	}

	private seedIfNeeded(): void {
		(Object.keys(seedData) as CollectionKey[]).forEach((col) => {
			if (localStorage.getItem(PREFIX + col) !== null) return;
			const rows = seedData[col].map((row) => ({
				id: this.newId(),
				...row,
				createdAt: Date.now(),
			}));
			localStorage.setItem(PREFIX + col, JSON.stringify(rows));
		});
	}

	private newId(): string {
		return crypto.randomUUID();
	}

	private read(col: CollectionKey): Doc[] {
		try {
			const raw = localStorage.getItem(PREFIX + col);
			return raw ? (JSON.parse(raw) as Doc[]) : [];
		} catch {
			return [];
		}
	}

	private write(col: CollectionKey, docs: Doc[]): void {
		localStorage.setItem(PREFIX + col, JSON.stringify(docs));
	}

	private notify(col: CollectionKey): void {
		const docs = this.read(col);
		this.listeners.get(col)?.forEach((cb) => cb(docs));
	}

	private readonly onStorage = (event: StorageEvent): void => {
		if (event.key?.startsWith(PREFIX)) {
			const col = event.key.slice(PREFIX.length) as CollectionKey;
			this.notify(col);
		}
	};

	subscribeCollection(col: CollectionKey, cb: (docs: Doc[]) => void): () => void {
		cb(this.read(col));
		const set = this.listeners.get(col) ?? new Set();
		set.add(cb);
		this.listeners.set(col, set);
		return () => {
			set.delete(cb);
		};
	}

	async create(col: CollectionKey, data: Record<string, unknown>): Promise<string> {
		const id = this.newId();
		this.write(col, [...this.read(col), { id, ...data, createdAt: Date.now() }]);
		this.notify(col);
		return id;
	}

	async createMany(col: CollectionKey, items: Record<string, unknown>[]): Promise<void> {
		if (items.length === 0) return;
		const createdAt = Date.now();
		this.write(col, [
			...this.read(col),
			...items.map((item) => ({ id: this.newId(), ...item, createdAt })),
		]);
		this.notify(col);
	}

	async update(col: CollectionKey, id: string, data: Record<string, unknown>): Promise<void> {
		this.write(col, this.read(col).map((doc) => (doc.id === id ? { ...doc, ...data } : doc)));
		this.notify(col);
	}

	async remove(col: CollectionKey, id: string): Promise<void> {
		this.write(col, this.read(col).filter((doc) => doc.id !== id));
		this.notify(col);
	}

	async batchDelete(col: CollectionKey, ids: string[]): Promise<void> {
		const toDelete = new Set(ids);
		this.write(col, this.read(col).filter((doc) => !toDelete.has(doc.id)));
		this.notify(col);
	}
}
