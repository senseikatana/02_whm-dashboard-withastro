import { useState } from 'react';
import {
	ArrowDownToLine,
	Box,
	LayoutDashboard,
	ListChecks,
	MessageCircle,
	Route,
	Send,
	UserCog,
	Users,
} from 'lucide-react';
import { getStore } from '../../data/store';
import { schemas } from '../../data/schemas';
import { useAuth } from '../../hooks/useAuth';
import { useCollections } from '../../hooks/useCollections';
import { useI18n, LocaleProvider } from '../../i18n/LocaleProvider';
import { generateMock } from '../../lib/mock';
import { ThemeProvider } from '../../lib/theme';
import type { CollectionKey, Operator, Session, ViewKey } from '../../types';
import { AdvancedPickingView } from './AdvancedPickingView';
import { CrudView } from './CrudView';
import { DashboardView } from './DashboardView';
import { Header } from './Header';
import { KittPanel } from './KittPanel';
import { LoginScreen } from './LoginScreen';
import { MessagingView } from './MessagingView';
import { MobileNav } from './MobileNav';
import { Sidebar, type NavItem } from './Sidebar';
import { ToastProvider } from './Toast';

const MOCK_LIMIT = 500;

function BootScreen() {
	const { S } = useI18n();
	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-950">
			<div className="flex flex-col items-center gap-3 text-white">
				<div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-indigo-500" />
				<p className="text-sm text-slate-400">{S.bootMessage}</p>
			</div>
		</div>
	);
}

interface DashboardShellProps {
	session: Session | null;
	signIn: (operator: Operator) => void;
	signOut: () => void;
}

function DashboardShell({ session, signIn, signOut }: DashboardShellProps) {
	const { S } = useI18n();
	const store = getStore();
	const collections = useCollections(true);
	const [view, setView] = useState<ViewKey>('dashboard');
	const [mobileOpen, setMobileOpen] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(
		() => localStorage.getItem('whm.sidebar.collapsed') === '1',
	);

	const navItems: NavItem[] = [
		{ key: 'dashboard', label: S.dashboard, icon: LayoutDashboard },
		{ key: 'inventory', label: S.inventory, icon: Box },
		{ key: 'picking', label: S.picking, icon: ListChecks },
		{ key: 'inOrders', label: S.inOrders, icon: ArrowDownToLine },
		{ key: 'outOrders', label: S.outOrders, icon: Send },
		{ key: 'routes', label: S.routes, icon: Route },
		{ key: 'messaging', label: S.messaging, icon: MessageCircle },
		{ key: 'crm', label: S.crm, icon: Users },
		{ key: 'users', label: S.users, icon: UserCog },
	];

	const DOCK_KEYS: ViewKey[] = ['dashboard', 'inventory', 'picking', 'messaging'];
	const dockItems = navItems.filter((item) => DOCK_KEYS.includes(item.key));

	const viewTitles: Record<ViewKey, string> = {
		dashboard: S.dashboard,
		inventory: S.inventory,
		picking: S.picking,
		inOrders: S.inOrders,
		outOrders: S.outOrders,
		routes: S.routes,
		messaging: S.messaging,
		crm: S.crm,
		users: S.users,
	};

	if (!session) {
		return (
			<LoginScreen
				operators={collections.users.docs}
				loading={collections.users.loading}
				onSelect={signIn}
			/>
		);
	}

	const isCrud = view !== 'dashboard' && view !== 'picking' && view !== 'messaging';
	const crudKey = (isCrud ? view : null) as CollectionKey | null;

	const canInjectMock = crudKey !== null && collections[crudKey].docs.length < MOCK_LIMIT;

	const navigate = (next: ViewKey) => {
		setView(next);
		setMobileOpen(false);
	};

	const toggleSidebar = () => {
		setSidebarCollapsed((value) => {
			localStorage.setItem('whm.sidebar.collapsed', value ? '0' : '1');
			return !value;
		});
	};

	const injectMock = async (entity: CollectionKey, count: number) => {
		await store.createMany(entity, generateMock(entity, count));
	};

	return (
		<div className="flex h-screen overflow-hidden bg-slate-100 font-sans text-gray-900 dark:bg-slate-950 dark:text-gray-100">
			<Sidebar
				items={navItems}
				active={view}
				onNavigate={navigate}
				open={mobileOpen}
				onClose={() => setMobileOpen(false)}
				collapsed={sidebarCollapsed}
			/>

			<main className="flex h-full flex-1 flex-col overflow-hidden">
				<Header
					session={session}
					onToggleSidebar={toggleSidebar}
					sidebarCollapsed={sidebarCollapsed}
					onSignOut={signOut}
				/>

				<div className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 md:pb-8">
					{view === 'dashboard' && <DashboardView collections={collections} />}
					{view === 'picking' && (
						<AdvancedPickingView
							outOrders={collections.outOrders.docs}
							inventory={collections.inventory.docs}
						/>
					)}
					{view === 'messaging' && <MessagingView />}
					{crudKey && (
						<CrudView
							entity={crudKey}
							title={viewTitles[crudKey]}
							store={store}
							collection={collections[crudKey]}
							allCollections={collections}
							fields={schemas[crudKey]}
							canInjectMock={canInjectMock}
							onInjectMock={injectMock}
						/>
					)}
				</div>

				<KittPanel collections={collections} />
			</main>

			<MobileNav
				items={dockItems}
				active={view}
				onNavigate={navigate}
				onMore={() => setMobileOpen(true)}
			/>
		</div>
	);
}

export default function App() {
	const { status, session, signIn, signOut } = useAuth();

	return (
		<LocaleProvider>
			<ThemeProvider>
				<ToastProvider>
					{status === 'loading' ? (
						<BootScreen />
					) : (
						<DashboardShell session={session} signIn={signIn} signOut={signOut} />
					)}
				</ToastProvider>
			</ThemeProvider>
		</LocaleProvider>
	);
}
