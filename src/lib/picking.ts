import type { Doc } from '../types';

export interface PickingTask {
	id: string;
	orderRef: string;
	client: string;
	qty: number;
	type: string;
}

// Tareas de picking REALES: pedidos de salida pendientes de preparar.
// Nada de datos inventados — solo lo que hay en el almacén.
export function buildPickingTasks(outOrders: Doc[]): PickingTask[] {
	return outOrders
		.filter((order) => order.status === 'Pendiente')
		.map((order) => ({
			id: String(order.id ?? ''),
			orderRef: String(order.orderRef ?? ''),
			client: String(order.client ?? ''),
			qty: Number(order.items) || 0,
			type: String(order.type ?? 'Estándar'),
		}))
		.sort((a, b) => a.orderRef.localeCompare(b.orderRef));
}
