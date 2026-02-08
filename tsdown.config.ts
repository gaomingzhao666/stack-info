import { defineConfig } from 'tsdown'
import type { UserConfig } from 'tsdown'

export default defineConfig({
	entry: {
		cli: 'src/index.ts',
	},
	outDir: 'dist',
	format: ['esm'],
	target: 'node18',
	clean: true,
	dts: true,
	banner: {
		js: '#!/usr/bin/env node',
	},

	external: ['node:fs', 'node:path', 'node:os', 'node:process'],
}) satisfies UserConfig as UserConfig
