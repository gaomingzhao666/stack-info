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
		...pkg.dependencies,
		...pkg.devDependencies,
	}

	function has(name: string) {
		return Boolean(deps[name])
	}

	function version(name: string) {
		return deps[name] || '-'
	}

	// Vite / Rolldown
	if (has('vite')) {
		// Rolldown sometimes masquerades as Vite-compatible
		const isRolldown =
			has('rolldown') || has('@rolldown/core') || has('vite-rolldown')

		return {
			name: isRolldown ? 'Rolldown (Vite-compatible)' : 'Vite',
			version: version('vite'),
		}
	}

	// Rspack
	if (has('@rspack/core') || has('rspack')) {
		return {
			name: 'Rspack',
			version: version('@rspack/core') || version('rspack'),
		}
	}

	// Webpack
	if (has('webpack')) {
		return {
			name: 'Webpack',
			version: version('webpack'),
		}
	}

	// Parcel
	if (has('parcel')) {
		return {
			name: 'Parcel',
			version: version('parcel'),
		}
	}

	// No builder detected
	return null
}
