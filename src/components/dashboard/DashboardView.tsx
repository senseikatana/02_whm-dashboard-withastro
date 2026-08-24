import { useState } from 'react';
import {
	AlertTriangle,
	ArrowDownToLine,
	CheckCircle2,
	Truck,
} from 'lucide-react';
import { useI18n } from '../../i18n/LocaleProvider';
import type { CollectionsState } from '../../hooks/useCollections';
import { KpiCard } from './KpiCard';

export function DashboardView({
	collections,
}: {
	collections: CollectionsState;
}) {
	const { S } = useI18n();

	const incoming = collections.inOrders.docs.length;
	const outgoing = collections.outOrders.docs.length;
	const critical = collections.inventory.docs.filter((item) => item.status === 'Crítico').length;
	const completed = collections.outOrders.docs.filter((order) => order.status === 'Completada').length;
	const fulfillment = outgoing > 0 ? Math.round((completed / outgoing) * 100) : 0;

	return (
		<div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
			<h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{S.dashboardTitle}</h2>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<KpiCard title={S.kpiIncoming} value={incoming} icon={ArrowDownToLine} />
				<KpiCard title={S.kpiOutgoing} value={outgoing} icon={Truck} />
				<KpiCard title={S.kpiCritical} value={critical} icon={AlertTriangle} tone="danger" />
				<KpiCard
					title={S.kpiFulfillment}
					value={`${fulfillment}%`}
					subtitle={S.fulfillmentSubtitle(completed, outgoing)}
					icon={CheckCircle2}
					tone="success"
				/>
			</div>
		</div>
	);
}
