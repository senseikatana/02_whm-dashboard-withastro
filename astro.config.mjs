// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
// En Astro 7 `output: "static"` se comporta como el antiguo "hybrid":
// las páginas se prerenderizan por defecto y las que marquen
// `export const prerender = false` se renderizan bajo demanda con el adapter Node.
export default defineConfig({
	output: 'static',
	adapter: node({ mode: 'standalone' }),
	integrations: [mdx(), react()],
	vite: {
		plugins: [tailwindcss()],
	},
});
