import { isFirebaseConfigured } from '../lib/firebase';
import type { CollectionKey, Doc } from '../types';
import { createFirestoreStore } from './firestoreStore';
import { createLocalStore } from './localStore';

export interface AppStore {
	readonly kind: 'local' | 'firestore';
	subscribeCollection(
		col: CollectionKey,
		cb: (docs: Doc[], error?: string) => void,
	): () => void;
	create(col: CollectionKey, data: Record<string, unknown>): Promise<string>;
	createMany(col: CollectionKey, items: Record<string, unknown>[]): Promise<void>;
	update(col: CollectionKey, id: string, data: Record<string, unknown>): Promise<void>;
	remove(col: CollectionKey, id: string): Promise<void>;
	batchDelete(col: CollectionKey, ids: string[]): Promise<void>;
}

let store: AppStore | null = null;

export function getStore(): AppStore {
	if (!store) {
		store = isFirebaseConfigured() ? createFirestoreStore() : createLocalStore();
	}
	return store;
}
