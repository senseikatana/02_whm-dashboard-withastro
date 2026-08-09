import type { CollectionKey } from '../types';

export function userCollectionPath(uid: string, collection: CollectionKey): string {
	const appId = import.meta.env.PUBLIC_FIREBASE_APP_ID ?? 'warehouseflow-app-id';
	return `artifacts/${appId}/users/${uid}/${collection}`;
}
