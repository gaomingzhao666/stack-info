import { c as matchPattern, f as resolveComma, h as toArray, l as noop, m as slash, o as prettyFormat } from "./logger-4jxMqy1-.mjs";
import { i as fsExists, n as formatBytes } from "./format-BD2e_4xO.mjs";
import { builtinModules, isBuiltin } from "node:module";
import { chmod } from "node:fs/promises";
import path from "node:path";
import { blue, bold, dim, green, underline, yellow } from "ansis";
import { createDebug } from "obug";
import { RE_DTS, RE_NODE_MODULES } from "rolldown-plugin-dts/filename";
import { promisify } from "node:util";
import { and, id, importerId, include } from "rolldown/filter";
import { Buffer } from "node:buffer";
import { brotliCompress, gzip } from "node:zlib";

//#region src/features/shims.ts
const shimFile = path.resolve(import.meta.dirname, "..", "esm-shims.js");
function getShimsInject(format, platform) {
	if (format === "es" && platform === "node") return {
		__dirname: [shimFile, "__dirname"],
		__filename: [shimFile, "__filename"]
	};
}

//#endregion
//#region src/features/dep.ts
const debug$1 = createDebug("tsdown:dep");
function DepPlugin({ pkg, noExternal, inlineOnly, skipNodeModulesBundle, logger, nameLabel }) {
	const deps = pkg && Array.from(getProductionDeps(pkg));
	return {
		name: "tsdown:external",
		resolveId: {
			filter: [include(and(id(/^[^.]/), importerId(/./)))],
			async handler(id, importer, extraOptions) {
				if (extraOptions.isEntry) return;
				const shouldExternal = await externalStrategy(this, id, importer, extraOptions);
				const nodeBuiltinModule = isBuiltin(id);
				debug$1("shouldExternal: %o = %o", id, shouldExternal);
				if (shouldExternal === true || shouldExternal === "absolute") return {
					id,
					external: shouldExternal,
					moduleSideEffects: nodeBuiltinModule ? false : void 0
				};
			}
		},
		generateBundle: inlineOnly === false ? void 0 : {
			order: "post",
			handler(options, bundle) {
				const deps = /* @__PURE__ */ new Set();
				const importers = /* @__PURE__ */ new Map();
				for (const chunk of Object.values(bundle)) {
					if (chunk.type === "asset") continue;
					for (const id of chunk.moduleIds) {
						if (!RE_NODE_MODULES.test(id)) continue;
						const parts = slash(id).split("/node_modules/").at(-1)?.split("/");
						if (!parts) continue;
						let dep;
						if (parts[0][0] === "@") dep = `${parts[0]}/${parts[1]}`;
						else dep = parts[0];
						deps.add(dep);
						const module = this.getModuleInfo(id);
						if (module) importers.set(dep, new Set([...module.importers, ...importers.get(dep) || []]));
					}
				}
				debug$1("found deps in bundle: %o", deps);
				if (inlineOnly) {
					const errors = Array.from(deps).filter((dep) => !matchPattern(dep, inlineOnly)).map((dep) => `${yellow(dep)} is located in ${blue`node_modules`} but is not included in ${blue`inlineOnly`} option.\nTo fix this, either add it to ${blue`inlineOnly`}, declare it as a production or peer dependency in your package.json, or externalize it manually.\nImported by\n${[...importers.get(dep) || []].map((s) => `- ${underline(s)}`).join("\n")}`);
					if (errors.length) this.error(errors.join("\n\n"));
					const unusedPatterns = inlineOnly.filter((pattern) => !Array.from(deps).some((dep) => matchPattern(dep, [pattern])));
					if (unusedPatterns.length) logger.info(nameLabel, `The following entries in ${blue`inlineOnly`} are not used in the bundle:\n${unusedPatterns.map((pattern) => `- ${yellow(pattern)}`).join("\n")}\nConsider removing them to keep your configuration clean.`);
				} else if (deps.size) logger.warn(nameLabel, `Consider adding ${blue`inlineOnly`} option to avoid unintended bundling of dependencies, or set ${blue`inlineOnly: false`} to disable this warning.\nDetected dependencies in bundle:\n${Array.from(deps).map((dep) => `- ${yellow(dep)}`).join("\n")}`);
			}
		}
	};
	/**
	* - `true`: always external
	* - `false`: skip, let other plugins handle it
	* - `'absolute'`: external as absolute path
	* - `'no-external'`: skip, but mark as non-external for inlineOnly check
	*/
	async function externalStrategy(context, id, importer, extraOptions) {
		if (id === shimFile) return false;
		if (noExternal?.(id, importer)) return "no-external";
		if (skipNodeModulesBundle) {
			const resolved = await context.resolve(id, importer, extraOptions);
			if (resolved && (resolved.external || RE_NODE_MODULES.test(resolved.id))) return true;
		}
		if (deps) {
			if (deps.includes(id) || deps.some((dep) => id.startsWith(`${dep}/`))) return true;
			if (importer && RE_DTS.test(importer) && !id.startsWith("@types/")) {
				const typesName = `@types/${id.replace(/^@/, "").replaceAll("/", "__")}`;
				if (deps.includes(typesName)) return true;
			}
		}
		return false;
	}
}
function getProductionDeps(pkg) {
	return new Set([...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})]);
}

//#endregion
//#region src/features/node-protocol.ts
/**
* The `node:` protocol was added in Node.js v14.18.0.
* @see https://nodejs.org/api/esm.html#node-imports
*/
function NodeProtocolPlugin(nodeProtocolOption) {
	const modulesWithoutProtocol = builtinModules.filter((mod) => !mod.startsWith("node:"));
	return {
		name: `tsdown:node-protocol`,
		resolveId: {
			order: "pre",
			filter: { id: nodeProtocolOption === "strip" ? new RegExp(`^node:(${modulesWithoutProtocol.join("|")})$`) : new RegExp(`^(${modulesWithoutProtocol.join("|")})$`) },
			handler: nodeProtocolOption === "strip" ? (id) => {
				return {
					id: id.slice(5),
					external: true,
					moduleSideEffects: false
				};
			} : (id) => {
				return {
					id: `node:${id}`,
					external: true,
					moduleSideEffects: false
				};
			}
		}
	};
}

//#endregion
//#region src/features/report.ts
const debug = createDebug("tsdown:report");
const brotliCompressAsync = promisify(brotliCompress);
const gzipAsync = promisify(gzip);
const defaultOptions = {
	gzip: true,
	brotli: false,
	maxCompressSize: 1e6
};
function ReportPlugin(userOptions, logger, cwd, cjsDts, nameLabel, isDualFormat) {
	const options = {
		...defaultOptions,
		...userOptions
	};
	return {
		name: "tsdown:report",
		async writeBundle(outputOptions, bundle) {
			const outDir = path.relative(cwd, outputOptions.file ? path.resolve(cwd, outputOptions.file, "..") : path.resolve(cwd, outputOptions.dir));
			const sizes = [];
			for (const chunk of Object.values(bundle)) {
				const size = await calcSize(options, chunk);
				sizes.push(size);
			}
			const filenameLength = Math.max(...sizes.map((size) => size.filename.length));
			const rawTextLength = Math.max(...sizes.map((size) => size.rawText.length));
			const gzipTextLength = Math.max(...sizes.map((size) => size.gzipText == null ? 0 : size.gzipText.length));
			const brotliTextLength = Math.max(...sizes.map((size) => size.brotliText == null ? 0 : size.brotliText.length));
			let totalRaw = 0;
			for (const size of sizes) {
				size.rawText = size.rawText.padStart(rawTextLength);
				size.gzipText = size.gzipText?.padStart(gzipTextLength);
				size.brotliText = size.brotliText?.padStart(brotliTextLength);
				totalRaw += size.raw;
			}
			sizes.sort((a, b) => {
				if (a.dts !== b.dts) return a.dts ? 1 : -1;
				if (a.isEntry !== b.isEntry) return a.isEntry ? -1 : 1;
				return b.raw - a.raw;
			});
			const formatLabel = isDualFormat && prettyFormat(cjsDts ? "cjs" : outputOptions.format);
			for (const size of sizes) {
				const filenameColor = size.dts ? green : noop;
				const filename = path.normalize(size.filename);
				logger.info(nameLabel, formatLabel, dim(outDir + path.sep) + filenameColor((size.isEntry ? bold : noop)(filename)), ` `.repeat(filenameLength - size.filename.length), dim(size.rawText), options.gzip && size.gzipText && dim`│ gzip: ${size.gzipText}`, options.brotli && size.brotliText && dim`│ brotli: ${size.brotliText}`);
			}
			const totalSizeText = formatBytes(totalRaw);
			logger.info(nameLabel, formatLabel, `${sizes.length} files, total: ${totalSizeText}`);
		}
	};
}
async function calcSize(options, chunk) {
	debug(`Calculating size for`, chunk.fileName);
	const content = chunk.type === "chunk" ? chunk.code : chunk.source;
	const raw = Buffer.byteLength(content, "utf8");
	debug("[size]", chunk.fileName, raw);
	let gzip = Infinity;
	let brotli = Infinity;
	if (raw > options.maxCompressSize) debug(chunk.fileName, "file size exceeds limit, skip gzip/brotli");
	else {
		if (options.gzip) {
			gzip = (await gzipAsync(content)).length;
			debug("[gzip]", chunk.fileName, gzip);
		}
		if (options.brotli) {
			brotli = (await brotliCompressAsync(content)).length;
			debug("[brotli]", chunk.fileName, brotli);
		}
	}
	return {
		filename: chunk.fileName,
		dts: RE_DTS.test(chunk.fileName),
		isEntry: chunk.type === "chunk" && chunk.isEntry,
		raw,
		rawText: formatBytes(raw),
		gzip,
		gzipText: formatBytes(gzip),
		brotli,
		brotliText: formatBytes(brotli)
	};
}

//#endregion
//#region src/features/shebang.ts
const RE_SHEBANG = /^#!.*/;
function ShebangPlugin(logger, cwd, nameLabel, isDualFormat) {
	return {
		name: "tsdown:shebang",
		async writeBundle(options, bundle) {
			for (const chunk of Object.values(bundle)) {
				if (chunk.type !== "chunk" || !chunk.isEntry) continue;
				if (!RE_SHEBANG.test(chunk.code)) continue;
				const filepath = path.resolve(cwd, options.file || path.join(options.dir, chunk.fileName));
				if (await fsExists(filepath)) {
					logger.info(nameLabel, isDualFormat && prettyFormat(options.format), `Granting execute permission to ${underline(path.relative(cwd, filepath))}`);
					await chmod(filepath, 493);
				}
			}
		}
	};
}

//#endregion
//#region src/utils/chunks.ts
function addOutDirToChunks(chunks, outDir) {
	return chunks.map((chunk) => {
		chunk.outDir = outDir;
		return chunk;
	});
}

//#endregion
//#region src/features/watch.ts
const endsWithConfig = /[\\/](?:tsdown\.config.*|package\.json|tsconfig\.json)$/;
function WatchPlugin(configFiles, { config, chunks }) {
	return {
		name: "tsdown:watch",
		options: config.ignoreWatch.length ? (inputOptions) => {
			inputOptions.watch ||= {};
			inputOptions.watch.exclude = toArray(inputOptions.watch.exclude);
			inputOptions.watch.exclude.push(...config.ignoreWatch);
		} : void 0,
		buildStart() {
			config.tsconfig && this.addWatchFile(config.tsconfig);
			for (const file of configFiles) this.addWatchFile(file);
			if (typeof config.watch !== "boolean") for (const file of resolveComma(toArray(config.watch))) this.addWatchFile(file);
			if (config.pkg) this.addWatchFile(config.pkg.packageJsonPath);
		},
		generateBundle: {
			order: "post",
			handler(outputOptions, bundle) {
				chunks.push(...addOutDirToChunks(Object.values(bundle), config.outDir));
			}
		}
	};
}

//#endregion
export { ReportPlugin as a, getShimsInject as c, ShebangPlugin as i, endsWithConfig as n, NodeProtocolPlugin as o, addOutDirToChunks as r, DepPlugin as s, WatchPlugin as t };