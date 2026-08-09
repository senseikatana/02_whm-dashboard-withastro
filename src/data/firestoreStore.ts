import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	onSnapshot,
	updateDoc,
	writeBatch,
	type FirestoreError,
} from 'firebase/firestore';
import { getFirebase } from '../lib/firebase';
import { userCollectionPath } from '../lib/paths';
import { sessionState } from '../lib/session';
import type { CollectionKey, Doc } from '../types';
import type { AppStore } from './store';

export function createFirestoreStore(): AppStore {
	return new FirestoreStore();
}

class FirestoreStore implements AppStore {
	readonly kind = 'firestore' as const;

	private colRef(col: CollectionKey) {
		const firebase = getFirebase();
		const uid = sessionState.uid;
		if (!firebase || !uid) return null;
		return collection(firebase.db, userCollectionPath(uid, col));
	}

	subscribeCollection(
		col: CollectionKey,
		cb: (docs: Doc[], error?: string) => void,
	): () => void {
		const ref = this.colRef(col);
		if (!ref) return () => {};

		return onSnapshot(
			ref,
			(snapshot) => {
				cb(snapshot.docs.map((snap) => ({ id: snap.id, ...snap.data() }) as Doc));
			},
			(error: FirestoreError) => {
				cb([], error.message);
			},
		);
	}

	async create(col: CollectionKey, data: Record<string, unknown>): Promise<string> {
		const ref = this.colRef(col);
		if (!ref) throw new Error('Firebase no configurado.');
		const created = await addDoc(ref, { ...data, createdAt: Date.now() });
		return created.id;
	}

	async createMany(col: CollectionKey, items: Record<string, unknown>[]): Promise<void> {
		const ref = this.colRef(col);
		const firebase = getFirebase();
		if (!ref || !firebase) throw new Error('Firebase no configurado.');
		if (items.length === 0) return;

		const batch = writeBatch(firebase.db);
		const createdAt = Date.now();
		for (const item of items) {
			batch.set(doc(ref), { ...item, createdAt });
		}
		await batch.commit();
	}

	async update(col: CollectionKey, id: string, data: Record<string, unknown>): Promise<void> {
		const ref = this.colRef(col);
		if (!ref) throw new Error('Firebase no configurado.');
		await updateDoc(doc(ref, id), data);
	}

	async remove(col: CollectionKey, id: string): Promise<void> {
		const ref = this.colRef(col);
		if (!ref) throw new Error('Firebase no configurado.');
		await deleteDoc(doc(ref, id));
	}

	async batchDelete(col: CollectionKey, ids: string[]): Promise<void> {
		const ref = this.colRef(col);
		const firebase = getFirebase();
		if (!ref || !firebase) throw new Error('Firebase no configurado.');

		const batch = writeBatch(firebase.db);
		for (const id of ids) {
			batch.delete(doc(ref, id));
		}
		await batch.commit();
	}
}
