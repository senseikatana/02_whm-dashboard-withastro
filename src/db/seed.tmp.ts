const PASSWORD = process.env.SEED_USER_PASSWORD ?? 'Cambiame123!';

const DEFAULT_USERS: { name: string; role_id: string; email?: string }[] = [
	{ name: 'Admin', role_id: 'admin' },
	{ name: 'Gerente', role_id: 'manager' },
	{ name: 'Picker', role_id: 'picker' },
	{ name: 'Formador', role_id: 'formador' },
	{ name: 'Prácticas', role_id: 'practicas' },
	{ name: 'Admin Demo', role_id: 'admin', email: 'admin@admin.com' },
	{ name: 'Picker Demo', role_id: 'picker', email: 'picker@demo.com' },
];

const DEMO_PASSWORD = 'admin12345678';