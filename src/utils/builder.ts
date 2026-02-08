import { readPackageJSON } from 'pkg-types'

export interface BuilderInfo {
	name: string
	version: string
}

/**
 * Detect the build tool used by the project.
 * Order matters: modern tools first.
 */
export async function getBuilder(cwd: string): Promise<BuilderInfo | null> {
	const pkg = await readPackageJSON(cwd).catch(() => null)
	if (!pkg) {
		return null
	}

	const deps = {
		...(pkg.dependencies || {}),
		...(pkg.devDependencies || {}),
	}

	const has = (name: string) => Boolean(deps[name])
	const versionOf = (name: string) => deps[name] ?? '-'

	// Vite / Rolldown
	if (has('vite')) {
		const isRolldown =
			has('rolldown') || has('@rolldown/core') || has('vite-rolldown')

		return {
			name: isRolldown ? 'Rolldown (Vite-compatible)' : 'Vite',
			version: versionOf('vite'),
		}
	}

	// Rspack
	if (has('@rspack/core') || has('rspack')) {
		return {
			name: 'Rspack',
			version: versionOf('@rspack/core') || versionOf('rspack'),
		}
	}

	// Webpack
	if (has('webpack')) {
		return {
			name: 'Webpack',
			version: versionOf('webpack'),
		}
	}

	// Parcel
	if (has('parcel')) {
		return {
			name: 'Parcel',
			version: versionOf('parcel'),
		}
	}

	return null
}
