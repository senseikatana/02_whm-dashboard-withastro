import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

interface FirebaseInstance {
	app: FirebaseApp;
	auth: Auth;
	db: Firestore;
}

const env = {
	apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
	authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
	appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
	return Boolean(env.apiKey && env.projectId && env.appId);
}

let instance: FirebaseInstance | null = null;

export function getFirebase(): FirebaseInstance | null {
	if (!isFirebaseConfigured()) return null;
	if (!instance) {
		const app = initializeApp({
			apiKey: env.apiKey!,
			authDomain: env.authDomain,
			projectId: env.projectId!,
			appId: env.appId!,
		});
		instance = { app, auth: getAuth(app), db: getFirestore(app) };
	}
	return instance;
}
