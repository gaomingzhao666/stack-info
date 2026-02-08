import os from 'node:os'
import process from 'node:process'
import clipboard from 'clipboardy'

import { box, log as logger } from '@clack/prompts'
import { defineCommand, type ArgDef } from 'citty'
import { colors } from 'consola/utils'
import { detectPackageManager } from 'nypm'
import { resolve } from 'pathe'
import { readPackageJSON, type PackageJson } from 'pkg-types'
import { isBun, isDeno, isMinimal } from 'std-env'

import { formatInfoBox } from '../utils/formatting.ts'
import { getPackageManagerVersion } from '../utils/packageManager.ts'

const cwdArgs = {
	cwd: {
		type: 'string',
		description: 'Specify the working directory',
		valueHint: 'directory',
		default: '.',
	},
} as const satisfies Record<string, ArgDef>

export default defineCommand({
	meta: {
		name: 'info',
		description: 'Get information about your project',
	},

	args: {
		...cwdArgs,
	},

	async run(ctx) {
		const cwd = resolve(ctx.args.cwd || process.cwd())

		const { dependencies = {}, devDependencies = {} } = await readPackageJSON(
			cwd,
		).catch(() => ({}) as PackageJson)

		const allDeps = {
			...dependencies,
			...devDependencies,
		}

		function getDepVersion(name: string) {
			return allDeps[name] || '-'
		}

		// detect prevail web frameworks
		const frameworks =
			[
				{ name: 'Vue', pkg: 'vue' },
				{ name: 'React', pkg: 'react' },
				{ name: 'Svelte', pkg: 'svelte' },
				{ name: 'Angular', pkg: '@angular/core' },
				{ name: 'Nuxt', pkg: 'nuxt' },
				{ name: 'Next', pkg: 'next' },
				{ name: 'Astro', pkg: 'astro' },
			]
				.filter((f) => allDeps[f.pkg])
				.map((f) => `${f.name}@${getDepVersion(f.pkg)}`)
				.join(', ') || 'None detected'

		// detect package manager
		let packageManager = (await detectPackageManager(cwd))?.name
		if (packageManager) {
			packageManager += `@${getPackageManagerVersion(packageManager)}`
		}

		// detect OS info
		const osType = os.type()

		const infoObj = {
			'Project root': cwd,
			'Operating system':
				osType === 'Darwin'
					? `macOS ${os.release()}`
					: osType === 'Windows_NT'
						? `Windows ${os.release()}`
						: `${osType} ${os.release()}`,
			CPU: `${os.cpus()[0]?.model || 'unknown'} (${os.cpus().length} cores)`,
			...(isBun
				? // @ts-expect-error Bun global
					{ 'Bun version': Bun?.version as string }
				: isDeno
					? // @ts-expect-error Deno global
						{ 'Deno version': Deno?.version.deno as string }
					: { 'Node.js version': process.version }),
			'Package manager': packageManager ?? 'unknown',
			Frameworks: frameworks,
		}

		// info outputs
		const boxStr = formatInfoBox(infoObj)

		let firstColumnLength = 0
		let secondColumnLength = 0

		const entries = Object.entries(infoObj).map(([label, val]) => {
			firstColumnLength = Math.max(firstColumnLength, label.length + 4)
			secondColumnLength = Math.max(secondColumnLength, String(val).length + 2)
			return [label, String(val || '-')] as const
		})

		let copyStr =
			`| ${' '.repeat(firstColumnLength)} | ${' '.repeat(secondColumnLength)} |\n` +
			`| ${'-'.repeat(firstColumnLength)} | ${'-'.repeat(secondColumnLength)} |\n`

		for (const [label, value] of entries) {
			if (!isMinimal) {
				copyStr +=
					`| ${`**${label}**`.padEnd(firstColumnLength)} | ` +
					`${(value.includes('`') ? value : `\`${value}\``).padEnd(secondColumnLength)} |\n`
			}
		}

		const copied =
			!isMinimal &&
			(await clipboard
				.write(copyStr)
				.then(() => true)
				.catch(() => false))

		if (copied) {
			box(
				`\n${boxStr}`,
				` Project info ${colors.gray('(copied to clipboard)')}`,
				{
					contentAlign: 'left',
					titleAlign: 'left',
					width: 'auto',
					titlePadding: 2,
					contentPadding: 2,
					rounded: true,
				},
			)
		} else {
			logger.info(`Project info:\n${copyStr}`)
		}
	},
})
