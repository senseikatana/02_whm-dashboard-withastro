import { createClient } from '@insforge/sdk';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { esinsaSeed } from '../src/data/seedEsinsa';
import type { CollectionKey } from '../src/types';

const TABLE = 'wms_docs';
const CSV_DIR = join(import.meta.dir, 'csv');

const url = process.env.PUBLIC_INSFORGE_URL;
const anonKey = process.env.PUBLIC_INSFORGE_ANON_KEY;

if (!url || !anonKey) {
	console.error('Faltan PUBLIC_INSFORGE_URL / PUBLIC_INSFORGE_ANON_KEY en .env');
	process.exit(1);
}

function toCsv(rows: Record<string, string | number>[]): string {
	if (rows.length === 0) return '';
	const headers = Object.keys(rows[0]);
	const lines = [headers.join(';')];
	for (const row of rows) {
		lines.push(headers.map((header) => String(row[header] ?? '')).join(';'));
	}
	return lines.join('\n');
}

async function main(): Promise<void> {
	const insforge = createClient({ baseUrl: url, anonKey });
	mkdirSync(CSV_DIR, { recursive: true });

	for (const [col, rows] of Object.entries(esinsaSeed) as [CollectionKey, Record<string, string | number>[]][]) {
		if (rows.length === 0) continue;
		const now = Date.now();
		const docs = rows.map((row) => ({
			id: crypto.randomUUID(),
			...row,
			createdAt: now,
		}));
		const { error } = await insforge.database
			.from(TABLE)
			.insert(
				docs.map((doc) => ({
					collection: col,
					id: doc.id,
					data: doc,
					created_at: now,
					updated_at: now,
				})),
			);
		if (error) {
			console.error(`[${col}] ERROR:`, JSON.stringify(error));
			continue;
		}
		writeFileSync(join(CSV_DIR, `${col}.csv`), toCsv(rows), 'utf8');
		console.log(`[${col}] ${docs.length} registros subidos + seed/csv/${col}.csv`);
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
