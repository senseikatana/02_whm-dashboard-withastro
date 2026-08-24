import { create } from 'zustand';
import type { ViewKey } from '../types';

interface AppState {
	view: ViewKey;
	sidebarCollapsed: boolean;
	mobileOpen: boolean;
	setView: (view: ViewKey) => void;
	toggleSidebar: () => void;
	setMobileOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
	view: 'dashboard',
	sidebarCollapsed: localStorage.getItem('whm.sidebar.collapsed') === '1',
	mobileOpen: false,
	setView: (view) => set({ view, mobileOpen: false }),
	toggleSidebar: () =>
		set((state) => {
			const next = !state.sidebarCollapsed;
			localStorage.setItem('whm.sidebar.collapsed', next ? '1' : '0');
			return { sidebarCollapsed: next };
		}),
	setMobileOpen: (open) => set({ mobileOpen: open }),
}));
