let currentUid: string | null = null;

export const sessionState = {
	get uid(): string | null {
		return currentUid;
	},
	setUid(uid: string | null) {
		currentUid = uid;
	},
};
