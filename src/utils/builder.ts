import { getPkgJSON, getPkgVersion } from './versions'

export function getBuilder(
	cwd: string,
	builder: Exclude<NuxtOptions['builder'] | NuxtConfig['builder'], NuxtBuilder>,
): { name: string; version: string } {
	switch (builder) {
		case 'rspack':
		case '@nuxt/rspack-builder':
			return { name: 'Rspack', version: getPkgVersion(cwd, '@rspack/core') }
		case 'webpack':
		case '@nuxt/webpack-builder':
			return { name: 'Webpack', version: getPkgVersion(cwd, 'webpack') }
		case 'vite':
		case '@nuxt/vite-builder':
		default: {
			const pkgJSON = getPkgJSON(cwd, 'vite')
			const isRolldown = pkgJSON.name.includes('rolldown')
			return {
				name: isRolldown ? 'Rolldown-Vite' : 'Vite',
				version: pkgJSON.version,
			}
		}
	}
}
