import type { Operator } from '../types';

const OPERATOR_KEY = 'whm.operator';

export const DEFAULT_OPERATOR: Operator = {
	uid: 'demo',
	name: 'Demo',
	role: 'Admin',
};

export const operatorStore = {
	load(): Operator | null {
		try {
			const raw = localStorage.getItem(OPERATOR_KEY);
			return raw ? (JSON.parse(raw) as Operator) : null;
		} catch {
			return null;
		}
	},
	save(operator: Operator) {
		localStorage.setItem(OPERATOR_KEY, JSON.stringify(operator));
	},
	clear() {
		localStorage.removeItem(OPERATOR_KEY);
	},
};
