export interface SpreadsheetData {
	name: string;
	size: number;
	columns: string[];
	rows: Record<string, unknown>[];
	rowCount: number;
}

const NUT_PATTERNS = [/nut/i, /cod/i, /sku/i, /^id$/i, /n.mero/i];
const NAME_PATTERNS = [/producto/i, /product/i, /art.culo/i, /nombre/i, /descrip/i, /referencia/i];

function detectColumn(columns: string[], patterns: RegExp[]): string | null {
	for (const pattern of patterns) {
		const match = columns.find((column) => pattern.test(column));
		if (match) return match;
	}
	return null;
}

function detectSeparator(text: string): string {
	const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
	const semicolons = (firstLine.match(/;/g) ?? []).length;
	const commas = (firstLine.match(/,/g) ?? []).length;
	return semicolons >= commas && semicolons > 0 ? ';' : ',';
}

function parseRow(line: string, separator: string): string[] {
	const cells: string[] = [];
	let current = '';
	let quoted = false;
	for (let i = 0; i < line.length; i++) {
		const char = line[i];
		if (char === '"') {
			if (quoted && line[i + 1] === '"') {
				current += '"';
				i++;
			} else {
				quoted = !quoted;
			}
		} else if (char === separator && !quoted) {
			cells.push(current.trim());
			current = '';
		} else {
			current += char;
		}
	}
	cells.push(current.trim());
	return cells;
}

function parseCsvText(text: string): Record<string, unknown>[] {
	const separator = detectSeparator(text);
	const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
	if (lines.length === 0) return [];
	const headers = parseRow(lines[0], separator);
	return lines.slice(1).map((line) => {
		const cells = parseRow(line, separator);
		const row: Record<string, unknown> = {};
		headers.forEach((header, index) => {
			row[header] = cells[index] ?? '';
		});
		return row;
	});
}

export async function parseCsvFile(file: File): Promise<SpreadsheetData> {
	const text = await file.text();
	const rows = parseCsvText(text);
	const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
	const nutKey = detectColumn(columns, NUT_PATTERNS);
	const nameKey = detectColumn(columns, NAME_PATTERNS);
	const normalized = rows.map((row) => {
		const out: Record<string, unknown> = { ...row };
		if (nutKey) out.nut = row[nutKey];
		if (nameKey) out.producto = row[nameKey];
		return out;
	});

	return {
		name: file.name,
		size: file.size,
		columns,
		rows: normalized,
		rowCount: normalized.length,
	};
}
