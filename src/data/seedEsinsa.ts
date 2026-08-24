import type { CollectionKey } from '../types';

export type EsinsaSeedRow = Record<string, string | number>;

const INVENTORY: EsinsaSeedRow[] = [
	{ sku: 'NUT0004001', name: 'Junta espiralada 316L DN50 PN16', abcClass: 'A', stock: 120, min: 40, status: 'OK' },
	{ sku: 'NUT0004002', name: 'Junta espiralada 316L DN80 PN16', abcClass: 'A', stock: 95, min: 30, status: 'OK' },
	{ sku: 'NUT0004003', name: 'Junta espiralada 316L DN100 PN16', abcClass: 'A', stock: 60, min: 25, status: 'OK' },
	{ sku: 'NUT0004004', name: 'Junta espiralada 316L DN150 PN16', abcClass: 'A', stock: 18, min: 20, status: 'Bajo' },
	{ sku: 'NUT0004005', name: 'Junta grafito flexible DN25', abcClass: 'B', stock: 200, min: 80, status: 'OK' },
	{ sku: 'NUT0004006', name: 'Junta grafito flexible DN50', abcClass: 'B', stock: 180, min: 70, status: 'OK' },
	{ sku: 'NUT0004007', name: 'Junta grafito flexible DN100', abcClass: 'B', stock: 55, min: 60, status: 'Bajo' },
	{ sku: 'NUT0004008', name: 'Junta PTFE DN40', abcClass: 'B', stock: 140, min: 50, status: 'OK' },
	{ sku: 'NUT0004009', name: 'Junta PTFE DN80', abcClass: 'B', stock: 75, min: 30, status: 'OK' },
	{ sku: 'NUT0004010', name: 'Junta kammprofile DN150', abcClass: 'A', stock: 25, min: 12, status: 'OK' },
	{ sku: 'NUT0004011', name: 'Junta kammprofile DN200', abcClass: 'A', stock: 8, min: 15, status: 'Bajo' },
	{ sku: 'NUT0004012', name: 'Junta metálica RTJ R24', abcClass: 'C', stock: 30, min: 15, status: 'OK' },
	{ sku: 'NUT0004013', name: 'Junta metálica RTJ R31', abcClass: 'C', stock: 6, min: 12, status: 'Crítico' },
	{ sku: 'NUT0004014', name: 'Junta cobre recocido DN20', abcClass: 'C', stock: 250, min: 100, status: 'OK' },
	{ sku: 'NUT0004015', name: 'Junta cobre recocido DN50', abcClass: 'C', stock: 160, min: 60, status: 'OK' },
	{ sku: 'NUT0004016', name: 'Espárrago ASTM A193 B7 M12x80', abcClass: 'A', stock: 500, min: 200, status: 'OK' },
	{ sku: 'NUT0004017', name: 'Espárrago ASTM A193 B7 M16x100', abcClass: 'A', stock: 420, min: 150, status: 'OK' },
	{ sku: 'NUT0004018', name: 'Espárrago ASTM A193 B7 M20x120', abcClass: 'A', stock: 300, min: 120, status: 'OK' },
	{ sku: 'NUT0004019', name: 'Espárrago ASTM A193 B8M M16x100', abcClass: 'B', stock: 180, min: 60, status: 'OK' },
	{ sku: 'NUT0004020', name: 'Espárrago ASTM A193 B16 M24x150', abcClass: 'B', stock: 35, min: 40, status: 'Bajo' },
	{ sku: 'NUT0004021', name: 'Tuerca hexagonal 2H M12', abcClass: 'A', stock: 800, min: 300, status: 'OK' },
	{ sku: 'NUT0004022', name: 'Tuerca hexagonal 2H M16', abcClass: 'A', stock: 700, min: 250, status: 'OK' },
	{ sku: 'NUT0004023', name: 'Tuerca hexagonal 8M M16', abcClass: 'B', stock: 450, min: 150, status: 'OK' },
	{ sku: 'NUT0004024', name: 'Varilla roscada B7 M12 (1 m)', abcClass: 'C', stock: 120, min: 40, status: 'OK' },
	{ sku: 'NUT0004025', name: 'Plancha acero al carbono 2000x1000x3 mm', abcClass: 'C', stock: 45, min: 20, status: 'OK' },
	{ sku: 'NUT0004026', name: 'Plancha inox 316L 3000x1500x2 mm', abcClass: 'C', stock: 5, min: 10, status: 'Crítico' },
	{ sku: 'NUT0004027', name: 'Plancha cobre 2000x1000x1,5 mm', abcClass: 'C', stock: 18, min: 8, status: 'OK' },
	{ sku: 'NUT0004028', name: 'Cubrebridas PTFE DN50', abcClass: 'C', stock: 60, min: 25, status: 'OK' },
	{ sku: 'NUT0004029', name: 'Cubrebridas PTFE DN100', abcClass: 'C', stock: 35, min: 15, status: 'OK' },
];

const IN_ORDERS: EsinsaSeedRow[] = [
	{ orderRef: 'IN-2026-1042', supplier: 'Novus (Flexitallic)', items: 320, type: 'Estocaje', status: 'Completado' },
	{ orderRef: 'IN-2026-1043', supplier: 'Klinger Ibérica', items: 150, type: 'Estocaje', status: 'Pendiente' },
	{ orderRef: 'IN-2026-1044', supplier: 'Garlock', items: 80, type: 'Cross-Docking', status: 'Descargando' },
	{ orderRef: 'IN-2026-1045', supplier: 'Lamons', items: 210, type: 'Estocaje', status: 'Pendiente' },
	{ orderRef: 'IN-2026-1046', supplier: 'Aceros Inox Tarragona', items: 60, type: 'Estocaje', status: 'Completado' },
];

const OUT_ORDERS: EsinsaSeedRow[] = [
	{ orderRef: 'OUT-2026-2201', client: 'Planta Química Sur S.A.', items: 48, type: 'Estándar', status: 'Pendiente' },
	{ orderRef: 'OUT-2026-2202', client: 'Refinería Tarraco', items: 120, type: 'Estándar', status: 'Pendiente' },
	{ orderRef: 'OUT-2026-2203', client: 'PetroTarraco Química', items: 36, type: 'Cross-Docking', status: 'Empacando' },
	{ orderRef: 'OUT-2026-2204', client: 'Indústries Riu Clar S.L.', items: 75, type: 'Estándar', status: 'En Ruta' },
	{ orderRef: 'OUT-2026-2205', client: 'Derivados Petroquímicos S.L.', items: 200, type: 'Estándar', status: 'Completada' },
	{ orderRef: 'OUT-2026-2206', client: 'Talleres Montblanc', items: 25, type: 'Cross-Docking', status: 'Pendiente' },
];

const ROUTES: EsinsaSeedRow[] = [
	{ routeId: 'R-AR-01', driver: 'Jordi Puig', status: 'En Ruta' },
	{ routeId: 'R-AR-02', driver: 'Maria Solé', status: 'Disponible' },
	{ routeId: 'R-AR-03', driver: 'Pere Vidal', status: 'Disponible' },
	{ routeId: 'R-AR-04', driver: 'Anna Ferrer', status: 'En Ruta' },
];

const CRM: EsinsaSeedRow[] = [
	{ code: 'CL-1001', company: 'Química del Camp S.A.', leadScore: 88, status: 'Cliente Activo' },
	{ code: 'CL-1002', company: 'PetroPlanta Tarraco', leadScore: 92, status: 'Cliente Activo' },
	{ code: 'CL-1003', company: 'Mantenimientos Riu Clar', leadScore: 60, status: 'En Negociación' },
	{ code: 'CL-1004', company: 'Aguas del Ebro S.L.', leadScore: 45, status: 'Nuevo Lead' },
];

export const esinsaSeed: Partial<Record<CollectionKey, readonly EsinsaSeedRow[]>> = {
	inventory: INVENTORY,
	inOrders: IN_ORDERS,
	outOrders: OUT_ORDERS,
	routes: ROUTES,
	crm: CRM,
};
