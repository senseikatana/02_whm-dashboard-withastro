// @ts-check
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import netlify from '@astrojs/netlify';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// En Astro 7 `output: "static"` se comporta como el antiguo "hybrid":
// las páginas se prerenderizan por defecto y las que marquen
// `export const prerender = false` se renderizan bajo demanda con el adapter.
//
// El adapter se elige con ASTRO_ADAPTER en el build de cada plataforma:
//   - sin definir      -> build 100% estático (vale para Netlify, Vercel,
//                         Cloudflare Pages y cualquier host de ficheros)
//   - "netlify"        -> @astrojs/netlify
//   - "vercel"         -> @astrojs/vercel
//   - "cloudflare"     -> @astrojs/cloudflare
//   - "node"           -> @astrojs/node (standalone, para VPS propio)
function pickAdapter() {
	switch (process.env.ASTRO_ADAPTER) {
		case 'netlify':
			return netlify();
		case 'vercel':
		case 'cloudflare':
			return cloudflare();
		case 'node':
			return node({ mode: 'standalone' });
		default:
			return undefined;
	}
}

// https://astro.build/config
export default defineConfig({
	output: 'static',
	adapter: pickAdapter(),
	integrations: [mdx(), react()],
	vite: {
		plugins: [tailwindcss()],
	},
});
