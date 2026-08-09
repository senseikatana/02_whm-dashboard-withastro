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
import { S } from '../../data/strings';
import { useAuth } from '../../hooks/useAuth';
import { useCollections } from '../../hooks/useCollections';
import { generateMock } from '../../lib/mock';
import type { CollectionKey, ViewKey } from '../../types';
import { AdvancedPickingView } from './AdvancedPickingView';
import { Copilot } from './Copilot';
import { CrudView } from './CrudView';
import { DashboardView } from './DashboardView';
import { Header } from './Header';
import { LoginScreen } from './LoginScreen';
import { Sidebar, type NavItem } from './Sidebar';
import { ToastProvider } from './Toast';
import { WhatsAppAgentView } from './WhatsAppAgentView';

const NAV_ITEMS: NavItem[] = [
	{ key: 'dashboard', label: S.dashboard, icon: LayoutDashboard },
	{ key: 'inventory', label: S.inventory, icon: Box },
	{ key: 'picking', label: S.picking, icon: ListChecks },
	{ key: 'inOrders', label: S.inOrders, icon: ArrowDownToLine },
	{ key: 'outOrders', label: S.outOrders, icon: Send },
	{ key: 'routes', label: S.routes, icon: Route },
	{ key: 'whatsapp', label: S.whatsapp, icon: MessageCircle },
	{ key: 'crm', label: S.crm, icon: Users },
	{ key: 'users', label: S.users, icon: UserCog },
];

const VIEW_TITLES: Record<ViewKey, string> = {
	dashboard: S.dashboard,
	inventory: S.inventory,
	picking: S.picking,
	inOrders: S.inOrders,
	outOrders: S.outOrders,
	routes: S.routes,
	whatsapp: S.whatsapp,
	crm: S.crm,
	users: S.users,
};

const MOCK_LIMIT = 500;

function BootScreen() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-950">
			<div className="flex flex-col items-center gap-3 text-white">
				<div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-indigo-500" />
				<p className="text-sm text-slate-400">{S.bootMessage}</p>
			</div>
		</div>
	);
}

export default function App() {
	const store = getStore();
	const { status, session, signIn, signOut } = useAuth();
	const collectionsActive = store.kind === 'local' || session !== null;
	const collections = useCollections(collectionsActive);
	const [view, setView] = useState<ViewKey>('dashboard');
	const [mobileOpen, setMobileOpen] = useState(false);

	if (status === 'loading') {
		return <BootScreen />;
	}

	if (!session) {
		return (
			<LoginScreen
				operators={collections.users.docs}
				loading={collections.users.loading}
				onSelect={signIn}
			/>
		);
	}

	const isCrud = view !== 'dashboard' && view !== 'picking' && view !== 'whatsapp';
	const crudKey = (isCrud ? view : null) as CollectionKey | null;

	const canInjectMock =
		crudKey !== null && collections[crudKey].docs.length < MOCK_LIMIT;

	const navigate = (next: ViewKey) => {
		setView(next);
		setMobileOpen(false);
	};

	const injectMock = async (entity: CollectionKey, count: number) => {
		await store.createMany(entity, generateMock(entity, count));
	};

	return (
		<ToastProvider>
			<div className="flex h-screen overflow-hidden bg-slate-100 font-sans text-gray-900">
				<Sidebar
					items={NAV_ITEMS}
					active={view}
					onNavigate={navigate}
					open={mobileOpen}
					onClose={() => setMobileOpen(false)}
				/>

				<main className="flex h-full flex-1 flex-col overflow-hidden">
					<Header
						mode={store.kind}
						session={session}
						onMenuClick={() => setMobileOpen(true)}
						onSignOut={signOut}
					/>

					<div className="flex-1 overflow-y-auto p-4 md:p-8">
						{view === 'dashboard' && <DashboardView collections={collections} />}
						{view === 'picking' && (
							<AdvancedPickingView
								outOrders={collections.outOrders.docs}
								inventory={collections.inventory.docs}
							/>
						)}
						{view === 'whatsapp' && <WhatsAppAgentView />}
						{crudKey && (
							<CrudView
								entity={crudKey}
								title={VIEW_TITLES[crudKey]}
								store={store}
								collection={collections[crudKey]}
								fields={schemas[crudKey]}
								canInjectMock={canInjectMock}
								onInjectMock={injectMock}
							/>
						)}
					</div>

					<Copilot inventoryCount={collections.inventory.docs.length} />
				</main>
			</div>
		</ToastProvider>
	);
}
