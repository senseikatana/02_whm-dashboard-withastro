import type { CollectionKey, FieldDef } from '../types';

export const schemas: Record<CollectionKey, readonly FieldDef[]> = {
	inventory: [
		{ key: 'sku', label: 'SKU', type: 'text', readonly: true, auto: true },
		{ key: 'name', label: 'Producto', type: 'text', colSpan: true },
		{ key: 'abcClass', label: 'Clase ABC', type: 'select', options: ['A', 'B', 'C'] },
		{ key: 'stock', label: 'Stock Actual', type: 'number' },
		{ key: 'min', label: 'Mínimo', type: 'number' },
		{ key: 'status', label: 'Estado', type: 'select', options: ['OK', 'Bajo', 'Crítico'] },
	],
	inOrders: [
		{ key: 'orderRef', label: 'Ref', type: 'text' },
		{ key: 'supplier', label: 'Proveedor', type: 'text' },
		{ key: 'items', label: 'Uds', type: 'number' },
		{ key: 'type', label: 'Operación', type: 'select', options: ['Estocaje', 'Cross-Docking'] },
		{ key: 'status', label: 'Estado', type: 'select', options: ['Pendiente', 'Descargando', 'Completado'] },
	],
	outOrders: [
		{ key: 'orderRef', label: 'Ref', type: 'text' },
		{ key: 'client', label: 'Cliente', type: 'text' },
		{ key: 'items', label: 'Uds', type: 'number' },
		{ key: 'type', label: 'Operación', type: 'select', options: ['Estándar', 'Cross-Docking'] },
		{ key: 'status', label: 'Estado', type: 'select', options: ['Pendiente', 'Empacando', 'En Ruta', 'Completada'] },
	],
	routes: [
		{ key: 'routeId', label: 'ID Ruta', type: 'text' },
		{ key: 'driver', label: 'Transportista', type: 'text' },
		{ key: 'status', label: 'Estado', type: 'select', options: ['Disponible', 'En Ruta', 'Cancelado'] },
	],
	crm: [
		{ key: 'company', label: 'Empresa', type: 'text' },
		{ key: 'leadScore', label: 'Lead Score', type: 'number' },
		{ key: 'status', label: 'Fase', type: 'select', options: ['Nuevo Lead', 'En Negociación', 'Cliente Activo'] },
	],
	users: [
		{ key: 'name', label: 'Operario', type: 'text' },
		{ key: 'role', label: 'Rol', type: 'select', options: ['Admin', 'Manager', 'Picker'] },
		{ key: 'status', label: 'Estado', type: 'select', options: ['Activo', 'Inactivo'] },
	],
};
