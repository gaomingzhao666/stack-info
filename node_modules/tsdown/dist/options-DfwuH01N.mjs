import { createRequire as __cjs_createRequire } from "node:module";
const __cjs_require = __cjs_createRequire(import.meta.url);
import { a as globalLogger, c as matchPattern, f as resolveComma, h as toArray, i as getNameLabel, m as slash, n as createLogger, p as resolveRegex, r as generateColor, u as pkgExists } from "./logger-4jxMqy1-.mjs";
import { a as fsRemove, c as stripExtname, i as fsExists, o as fsStat, s as lowestCommonAncestor, t as detectIndentation } from "./format-BD2e_4xO.mjs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process, { env } from "node:process";
import { blue, underline } from "ansis";
import { createDefu } from "defu";
import { createDebug } from "obug";
import { glob, isDynamicPattern } from "tinyglobby";
import { pathToFileURL } from "node:url";
const picomatch = __cjs_require("picomatch");
import { readFileSync, writeFileSync } from "node:fs";
import { RE_CSS, RE_DTS } from "rolldown-plugin-dts/filename";
const minVersion = __cjs_require("semver/ranges/min-version.js");
import { up } from "empathic/find";
import { up as up$1 } from "empathic/package";
import { init, isSupported } from "import-without-cache";
import { createConfigCoreLoader } from "unconfig-core";

//#region node_modules/.pnpm/is-in-ci@2.0.0/node_modules/is-in-ci/index.js
const check = (key) => key in env && env[key] !== "0" && env[key] !== "false";
const isInCi = check("CI") || check("CONTINUOUS_INTEGRATION");

//#endregion
//#region src/features/clean.ts
const debug$3 = createDebug("tsdown:clean");
const RE_LAST_SLASH = /[/\\]$/;
async function cleanOutDir(configs) {
	const removes = /* @__PURE__ */ new Set();
	for (const config of configs) {
		if (config.devtools && (config.devtools.clean ?? true)) config.clean.push("node_modules/.rolldown");
		if (!config.clean.length) continue;
		const files = await glob(config.clean, {
			cwd: config.cwd,
			absolute: true,
			onlyFiles: false,
			dot: true
		});
		const normalizedOutDir = config.outDir.replace(RE_LAST_SLASH, "");
		for (const file of files) if (file.replace(RE_LAST_SLASH, "") !== normalizedOutDir) removes.add(file);
	}
	if (!removes.size) return;
	globalLogger.info(`Cleaning ${removes.size} files`);
	await Promise.all([...removes].map(async (file) => {
		debug$3("Removing", file);
		await fsRemove(file);
	}));
	debug$3("Removed %d files", removes.size);
}
function resolveClean(clean, outDir, cwd) {
	if (clean === true) clean = [slash(outDir)];
	else if (!clean) clean = [];
	if (clean.some((item) => path.resolve(item) === cwd)) throw new Error("Cannot clean the current working directory. Please specify a different path to clean option.");
	return clean;
}
async function cleanChunks(outDir, chunks) {
	await Promise.all(chunks.map(async (chunk) => {
		const filePath = path.resolve(outDir, chunk.fileName);
		debug$3("Removing chunk file", filePath);
		await fsRemove(filePath);
	}));
}

//#endregion
//#region src/features/css/index.ts
const defaultCssBundleName = "style.css";
function resolveCssOptions(options = {}) {
	return {
		splitting: options.splitting ?? true,
		fileName: options.fileName ?? defaultCssBundleName
	};
}

//#endregion
//#region src/features/entry.ts
async function resolveEntry(logger, entry, cwd, color, nameLabel) {
	if (!entry || Object.keys(entry).length === 0) {
		const defaultEntry = path.resolve(cwd, "src/index.ts");
		if (await fsExists(defaultEntry)) entry = { index: defaultEntry };
		else throw new Error(`${nameLabel} No input files, try "tsdown <your-file>" or create src/index.ts`);
	}
	const entryMap = await toObjectEntry(entry, cwd);
	const entries = Object.values(entryMap);
	if (entries.length === 0) throw new Error(`${nameLabel} Cannot find entry: ${JSON.stringify(entry)}`);
	logger.info(nameLabel, `entry: ${color(entries.map((entry) => path.relative(cwd, entry)).join(", "))}`);
	return entryMap;
}
function toObjectEntry(entry, cwd) {
	if (typeof entry === "string") entry = [entry];
	if (!Array.isArray(entry)) return resolveObjectEntry(entry, cwd);
	return resolveArrayEntry(entry, cwd);
}
async function resolveObjectEntry(entries, cwd) {
	return Object.fromEntries((await Promise.all(Object.entries(entries).map(async ([key, value]) => {
		if (!key.includes("*")) {
			if (Array.isArray(value)) throw new TypeError(`Object entry "${key}" cannot have an array value when the key is not a glob pattern.`);
			return [[key, value]];
		}
		const patterns = toArray(value);
		const files = await glob(patterns, {
			cwd,
			expandDirectories: false
		});
		if (!files.length) throw new Error(`Cannot find files for entry key "${key}" with patterns: ${JSON.stringify(patterns)}`);
		let valueGlobBase;
		for (const pattern of patterns) {
			if (pattern.startsWith("!")) continue;
			const base = picomatch.scan(pattern).base;
			if (valueGlobBase === void 0) valueGlobBase = base;
			else if (valueGlobBase !== base) throw new Error(`When using object entry with glob pattern key "${key}", all value glob patterns must have the same base directory.`);
		}
		if (valueGlobBase === void 0) throw new Error(`Cannot determine base directory for value glob patterns of key "${key}".`);
		return files.map((file) => [slash(key.replaceAll("*", stripExtname(path.relative(valueGlobBase, file)))), path.resolve(cwd, file)]);
	}))).flat());
}
async function resolveArrayEntry(entries, cwd) {
	const stringEntries = [];
	const objectEntries = [];
	for (const e of entries) if (typeof e === "string") stringEntries.push(e);
	else objectEntries.push(e);
	const isGlob = stringEntries.some((e) => isDynamicPattern(e));
	let resolvedEntries;
	if (isGlob) resolvedEntries = (await glob(stringEntries, {
		cwd,
		expandDirectories: false,
		absolute: true
	})).map((file) => path.resolve(file));
	else resolvedEntries = stringEntries;
	const base = lowestCommonAncestor(...resolvedEntries);
	const arrayEntryMap = Object.fromEntries(resolvedEntries.map((file) => {
		return [slash(stripExtname(path.relative(base, file))), file];
	}));
	return Object.assign({}, arrayEntryMap, ...await Promise.all(objectEntries.map((entry) => resolveObjectEntry(entry, cwd))));
}

//#endregion
//#region src/features/pkg/exports.ts
async function writeExports(options, chunks) {
	const { pkg } = options;
	const { publishExports, ...generated } = await generateExports(pkg, chunks, options);
	const updatedPkg = {
		...pkg,
		...generated,
		packageJsonPath: void 0
	};
	if (publishExports) {
		updatedPkg.publishConfig ||= {};
		updatedPkg.publishConfig.exports = publishExports;
	}
	const original = readFileSync(pkg.packageJsonPath, "utf8");
	let contents = JSON.stringify(updatedPkg, null, detectIndentation(original));
	if (original.endsWith("\n")) contents += "\n";
	if (contents !== original) writeFileSync(pkg.packageJsonPath, contents, "utf8");
}
function shouldExclude(fileName, exclude) {
	if (!exclude?.length) return false;
	return matchPattern(fileName, exclude);
}
async function generateExports(pkg, chunks, options) {
	let { exports: { devExports, all, packageJson = true, exclude, customExports, legacy }, css, logger } = options;
	const pkgRoot = path.dirname(pkg.packageJsonPath);
	let main, module, cjsTypes, esmTypes;
	const exportsMap = /* @__PURE__ */ new Map();
	const formats = Object.keys(chunks);
	if (!formats.includes("cjs") && !formats.includes("es")) logger.warn(`No CJS or ESM formats found in chunks for package ${pkg.name}`);
	const isPureESM = formats.length === 1 && formats[0] === "es";
	legacy ??= !isPureESM;
	for (const [format, chunksByFormat] of Object.entries(chunks)) {
		if (format !== "es" && format !== "cjs") continue;
		const filteredChunks = chunksByFormat.filter((chunk) => {
			if (chunk.type !== "chunk" || !chunk.isEntry) return false;
			const [name] = getExportName(chunk);
			return !shouldExclude(name, exclude);
		});
		const onlyOneEntry = filteredChunks.filter((chunk) => !RE_DTS.test(chunk.fileName)).length === 1;
		for (const chunk of filteredChunks) {
			let [name, normalizedName, isDts] = getExportName(chunk);
			const isIndex = onlyOneEntry || name === "index";
			const distFile = join(pkgRoot, chunk.outDir, normalizedName);
			if (isIndex) {
				name = ".";
				if (format === "cjs") if (isDts) cjsTypes = distFile;
				else main = distFile;
				else if (format === "es") if (isDts) esmTypes = distFile;
				else module = distFile;
			} else if (name.endsWith("/index")) name = `./${name.slice(0, -6)}`;
			else name = `./${name}`;
			let subExport = exportsMap.get(name);
			if (!subExport) {
				subExport = {};
				exportsMap.set(name, subExport);
			}
			if (!isDts) {
				subExport[format] = distFile;
				if (chunk.facadeModuleId && !subExport.src) subExport.src = `./${slash(path.relative(pkgRoot, chunk.facadeModuleId))}`;
			}
		}
	}
	const sortedExportsMap = Array.from(exportsMap.entries()).toSorted(([a], [b]) => {
		if (a === "index") return -1;
		return a.localeCompare(b);
	});
	let exports = Object.fromEntries(sortedExportsMap.map(([name, subExport]) => [name, genSubExport(devExports, subExport)]));
	exportMeta(exports, all, packageJson);
	exportCss(exports, chunks, css, pkgRoot);
	if (customExports) exports = await customExports(exports, {
		pkg,
		chunks,
		isPublish: false
	});
	let publishExports;
	if (devExports) {
		publishExports = Object.fromEntries(sortedExportsMap.map(([name, subExport]) => [name, genSubExport(false, subExport)]));
		exportMeta(publishExports, all, packageJson);
		exportCss(publishExports, chunks, css, pkgRoot);
		if (customExports) publishExports = await customExports(publishExports, {
			pkg,
			chunks,
			isPublish: true
		});
	}
	return {
		main: legacy ? main || module || pkg.main : void 0,
		module: legacy ? module || pkg.module : void 0,
		types: legacy ? cjsTypes || esmTypes || pkg.types : pkg.types,
		exports,
		publishExports
	};
}
function genSubExport(devExports, { src, es, cjs }) {
	if (devExports === true) return src;
	let value;
	const dualFormat = es && cjs;
	if (!dualFormat && !devExports) value = cjs || es;
	else {
		value = {};
		if (typeof devExports === "string") value[devExports] = src;
		if (es) value[dualFormat ? "import" : "default"] = es;
		if (cjs) value[dualFormat ? "require" : "default"] = cjs;
	}
	return value;
}
function exportMeta(exports, all, packageJson) {
	if (all) exports["./*"] = "./*";
	else if (packageJson) exports["./package.json"] = "./package.json";
}
function exportCss(exports, chunks, { splitting }, pkgRoot) {
	if (splitting) return;
	for (const chunksByFormat of Object.values(chunks)) for (const chunk of chunksByFormat) if (chunk.type === "asset" && RE_CSS.test(chunk.fileName)) {
		const filename = slash(chunk.fileName);
		exports[`./${filename}`] = join(pkgRoot, chunk.outDir, filename);
		return;
	}
}
function hasExportsTypes(pkg) {
	const exports = pkg?.exports;
	if (!exports) return false;
	if (typeof exports === "object" && exports !== null && !Array.isArray(exports)) {
		if ("types" in exports) return true;
		if ("." in exports) {
			const mainExport = exports["."];
			if (typeof mainExport === "object" && mainExport !== null && "types" in mainExport) return true;
		}
	}
	return false;
}
function getExportName(chunk) {
	const normalizedName = slash(chunk.fileName);
	let name = stripExtname(normalizedName);
	const isDts = name.endsWith(".d");
	if (isDts) name = name.slice(0, -2);
	return [
		name,
		normalizedName,
		isDts
	];
}
function join(pkgRoot, outDir, fileName) {
	const outDirRelative = slash(path.relative(pkgRoot, outDir));
	return `${outDirRelative ? `./${outDirRelative}` : "."}/${fileName}`;
}

//#endregion
//#region src/features/target.ts
function resolveTarget(logger, target, color, pkg, nameLabel) {
	if (target === false) return;
	if (target == null) {
		const pkgTarget = resolvePackageTarget(pkg);
		if (pkgTarget) target = pkgTarget;
		else return;
	}
	if (typeof target === "number") throw new TypeError(`Invalid target: ${target}`);
	const targets = resolveComma(toArray(target));
	if (targets.length) logger.info(nameLabel, `target${targets.length > 1 ? "s" : ""}: ${color(targets.join(", "))}`);
	return targets;
}
function resolvePackageTarget(pkg) {
	const nodeVersion = pkg?.engines?.node;
	if (!nodeVersion) return;
	const nodeMinVersion = minVersion(nodeVersion);
	if (!nodeMinVersion) return;
	if (nodeMinVersion.version === "0.0.0") return;
	return `node${nodeMinVersion.version}`;
}

//#endregion
//#region src/features/tsconfig.ts
function findTsconfig(cwd, name = "tsconfig.json") {
	return up(name, { cwd }) || false;
}
async function resolveTsconfig(logger, tsconfig, cwd, color, nameLabel) {
	const original = tsconfig;
	if (tsconfig !== false) {
		if (tsconfig === true || tsconfig == null) {
			tsconfig = findTsconfig(cwd);
			if (original && !tsconfig) logger.warn(`No tsconfig found in ${blue(cwd)}`);
		} else {
			const tsconfigPath = path.resolve(cwd, tsconfig);
			const stat = await fsStat(tsconfigPath);
			if (stat?.isFile()) tsconfig = tsconfigPath;
			else if (stat?.isDirectory()) {
				tsconfig = findTsconfig(tsconfigPath);
				if (!tsconfig) logger.warn(`No tsconfig found in ${blue(tsconfigPath)}`);
			} else {
				tsconfig = findTsconfig(cwd, tsconfig);
				if (!tsconfig) logger.warn(`tsconfig ${blue(original)} doesn't exist`);
			}
		}
		if (tsconfig) logger.info(nameLabel, `tsconfig: ${color(path.relative(cwd, tsconfig))}`);
	}
	return tsconfig;
}

//#endregion
//#region src/utils/package.ts
const debug$2 = createDebug("tsdown:package");
async function readPackageJson(dir) {
	const packageJsonPath = up$1({ cwd: dir });
	if (!packageJsonPath) return;
	debug$2("Reading package.json:", packageJsonPath);
	const contents = await readFile(packageJsonPath, "utf8");
	return {
		...JSON.parse(contents),
		packageJsonPath
	};
}
function getPackageType(pkg) {
	if (pkg?.type) {
		if (!["module", "commonjs"].includes(pkg.type)) throw new Error(`Invalid package.json type: ${pkg.type}`);
		return pkg.type;
	}
}
function normalizeFormat(format) {
	switch (format) {
		case "es":
		case "esm":
		case "module": return "es";
		case "cjs":
		case "commonjs": return "cjs";
		default: return format;
	}
}

//#endregion
//#region src/config/file.ts
const debug$1 = createDebug("tsdown:config:file");
async function loadViteConfig(prefix, cwd, configLoader) {
	const loader = resolveConfigLoader(configLoader);
	debug$1("Loading Vite config via loader: ", loader);
	const parser = createParser(loader);
	const [result] = await createConfigCoreLoader({
		sources: [{
			files: [`${prefix}.config`],
			extensions: [
				"js",
				"mjs",
				"ts",
				"cjs",
				"mts",
				"cts"
			],
			parser
		}],
		cwd
	}).load(true);
	if (!result) return;
	const { config, source } = result;
	globalLogger.info(`Using Vite config: ${underline(source)}`);
	const resolved = await config;
	if (typeof resolved === "function") return resolved({
		command: "build",
		mode: "production"
	});
	return resolved;
}
const configPrefix = "tsdown.config";
async function loadConfigFile(inlineConfig, workspace) {
	let cwd = inlineConfig.cwd || process.cwd();
	let overrideConfig = false;
	let { config: filePath } = inlineConfig;
	if (filePath === false) return { configs: [{}] };
	if (typeof filePath === "string") {
		const stats = await fsStat(filePath);
		if (stats) {
			const resolved = path.resolve(filePath);
			if (stats.isFile()) {
				overrideConfig = true;
				filePath = resolved;
				cwd = path.dirname(filePath);
			} else if (stats.isDirectory()) cwd = resolved;
		}
	}
	const loader = resolveConfigLoader(inlineConfig.configLoader);
	debug$1("Using config loader:", loader);
	const parser = createParser(loader);
	const [result] = await createConfigCoreLoader({
		sources: overrideConfig ? [{
			files: [filePath],
			extensions: [],
			parser
		}] : [{
			files: [configPrefix],
			extensions: [
				"ts",
				"mts",
				"cts",
				"js",
				"mjs",
				"cjs",
				"json"
			],
			parser
		}, {
			files: ["package.json"],
			parser
		}],
		cwd,
		stopAt: workspace && path.dirname(workspace)
	}).load(true);
	let exported = [];
	let file;
	if (result) {
		({config: exported, source: file} = result);
		globalLogger.info(`config file: ${underline(file)}`, loader === "native" ? "" : `(${loader})`);
		exported = await exported;
		if (typeof exported === "function") exported = await exported(inlineConfig, { ci: isInCi });
	}
	exported = toArray(exported);
	if (exported.length === 0) exported.push({});
	if (exported.some((config) => typeof config === "function")) throw new Error("Function should not be nested within multiple tsdown configurations. It must be at the top level.\nExample: export default defineConfig(() => [...])");
	return {
		configs: exported.map((config) => ({
			...config,
			cwd: config.cwd ? path.resolve(cwd, config.cwd) : cwd
		})),
		file
	};
}
const isBun = !!process.versions.bun;
const nativeTS = process.features.typescript || process.versions.deno;
const autoLoader = isBun || nativeTS && isSupported ? "native" : "unrun";
function resolveConfigLoader(configLoader = "auto") {
	if (configLoader === "auto") return autoLoader;
	else return configLoader === "native" ? "native" : "unrun";
}
function createParser(loader) {
	return async (filepath) => {
		const basename = path.basename(filepath);
		const isPkgJson = basename === "package.json";
		if (basename === configPrefix || isPkgJson || basename.endsWith(".json")) {
			const contents = await readFile(filepath, "utf8");
			const parsed = JSON.parse(contents);
			if (isPkgJson) return parsed?.tsdown;
			return parsed;
		}
		if (loader === "native") return nativeImport(filepath);
		return unrunImport(filepath);
	};
}
async function nativeImport(id) {
	const url = pathToFileURL(id);
	const importAttributes = Object.create(null);
	if (isSupported) {
		importAttributes.cache = "no";
		init({ skipNodeModules: true });
	} else if (!isBun) url.searchParams.set("no-cache", crypto.randomUUID());
	const mod = await import(url.href, { with: importAttributes }).catch((error) => {
		if (error?.message?.includes?.("Cannot find module")) throw new Error(`Failed to load the config file. Try setting the --config-loader CLI flag to \`unrun\`.\n\n${error.message}`, { cause: error });
		else throw error;
	});
	return mod.default || mod;
}
async function unrunImport(id) {
	const { unrun } = await import("unrun");
	const { module } = await unrun({ path: pathToFileURL(id).href });
	return module;
}

//#endregion
//#region src/config/options.ts
const debug = createDebug("tsdown:config:options");
const parseEnv = process.getBuiltinModule("node:util").parseEnv;
/**
* Resolve user config into resolved configs
*
* **Internal API, not for public use**
* @private
*/
async function resolveUserConfig(userConfig, inlineConfig) {
	let { entry, format = ["es"], plugins = [], clean = true, logLevel = "info", failOnWarn = "ci-only", customLogger, treeshake = true, platform = "node", outDir = "dist", sourcemap = false, dts, unused = false, watch = false, ignoreWatch, shims = false, skipNodeModulesBundle = false, publint = false, attw = false, fromVite, alias, tsconfig, report = true, target, env = {}, envFile, envPrefix = "TSDOWN_", copy, publicDir, hash = true, cwd = process.cwd(), name, workspace, external, noExternal, exports = false, bundle, unbundle = typeof bundle === "boolean" ? !bundle : false, removeNodeProtocol, nodeProtocol, cjsDefault = true, globImport = true, inlineOnly, css, fixedExtension = platform === "node", devtools = false, write = true } = userConfig;
	const pkg = await readPackageJson(cwd);
	if (workspace) name ||= pkg?.name;
	const color = generateColor(name);
	const nameLabel = getNameLabel(color, name);
	if (!filterConfig(inlineConfig.filter, cwd, name)) {
		debug("[filter] skipping config %s", cwd);
		return [];
	}
	const logger = createLogger(logLevel, {
		customLogger,
		failOnWarn: resolveFeatureOption(failOnWarn, true)
	});
	if (typeof bundle === "boolean") logger.warn("`bundle` option is deprecated. Use `unbundle` instead.");
	if (removeNodeProtocol) {
		if (nodeProtocol) throw new TypeError("`removeNodeProtocol` is deprecated. Please only use `nodeProtocol` instead.");
		logger.warn("`removeNodeProtocol` is deprecated. Use `nodeProtocol: \"strip\"` instead.");
	}
	nodeProtocol = nodeProtocol ?? (removeNodeProtocol ? "strip" : false);
	outDir = path.resolve(cwd, outDir);
	clean = resolveClean(clean, outDir, cwd);
	const resolvedEntry = await resolveEntry(logger, entry, cwd, color, nameLabel);
	if (dts == null) dts = !!(pkg?.types || pkg?.typings || hasExportsTypes(pkg));
	target = resolveTarget(logger, target, color, pkg, nameLabel);
	tsconfig = await resolveTsconfig(logger, tsconfig, cwd, color, nameLabel);
	if (typeof external === "string") external = resolveRegex(external);
	if (typeof noExternal === "string") noExternal = resolveRegex(noExternal);
	publint = resolveFeatureOption(publint, {});
	attw = resolveFeatureOption(attw, {});
	exports = resolveFeatureOption(exports, {});
	unused = resolveFeatureOption(unused, {});
	report = resolveFeatureOption(report, {});
	dts = resolveFeatureOption(dts, {});
	if (!pkg) {
		if (exports) throw new Error("`package.json` not found, cannot write exports");
		if (publint) logger.warn(nameLabel, "publint is enabled but package.json is not found");
		if (attw) logger.warn(nameLabel, "attw is enabled but package.json is not found");
	}
	if (publicDir) if (copy) throw new TypeError("`publicDir` is deprecated. Cannot be used with `copy`");
	else logger.warn(`${blue`publicDir`} is deprecated. Use ${blue`copy`} instead.`);
	envPrefix = toArray(envPrefix);
	if (envPrefix.includes("")) logger.warn("`envPrefix` includes an empty string; filtering is disabled. All environment variables from the env file and process.env will be injected into the build. Ensure this is intended to avoid accidental leakage of sensitive information.");
	const envFromProcess = filterEnv(process.env, envPrefix);
	if (envFile) {
		if (!parseEnv) throw new Error(`Your runtime does not support 'util.parseEnv()'. Please upgrade to Node.js v20.12.0 or later.`);
		const resolvedPath = path.resolve(cwd, envFile);
		logger.info(nameLabel, `env file: ${color(resolvedPath)}`);
		env = {
			...filterEnv(parseEnv(await readFile(resolvedPath, "utf8")), envPrefix),
			...envFromProcess,
			...env
		};
	} else env = {
		...envFromProcess,
		...env
	};
	debug(`Environment variables: %O`, env);
	if (fromVite) {
		const viteUserConfig = await loadViteConfig(fromVite === true ? "vite" : fromVite, cwd, inlineConfig.configLoader);
		if (viteUserConfig) {
			const viteAlias = viteUserConfig.resolve?.alias;
			if (Array.isArray(viteAlias)) throw new TypeError("Unsupported resolve.alias in Vite config. Use object instead of array");
			if (viteAlias) alias = {
				...alias,
				...viteAlias
			};
			if (viteUserConfig.plugins) plugins = [viteUserConfig.plugins, plugins];
		}
	}
	ignoreWatch = toArray(ignoreWatch).map((ignore) => {
		ignore = resolveRegex(ignore);
		if (typeof ignore === "string") return path.resolve(cwd, ignore);
		return ignore;
	});
	if (noExternal != null && typeof noExternal !== "function") {
		const noExternalPatterns = toArray(noExternal);
		noExternal = (id) => matchPattern(id, noExternalPatterns);
	}
	if (skipNodeModulesBundle && noExternal != null) throw new TypeError("`skipNodeModulesBundle` and `noExternal` are mutually exclusive options and cannot be used together.");
	if (inlineOnly != null && inlineOnly !== false) inlineOnly = toArray(inlineOnly);
	devtools = resolveFeatureOption(devtools, {});
	if (devtools) if (watch) {
		if (devtools.ui) logger.warn("Devtools UI is not supported in watch mode, disabling it.");
		devtools.ui = false;
	} else devtools.ui ??= !!pkgExists("@vitejs/devtools/cli");
	const config = {
		...userConfig,
		alias,
		attw,
		cjsDefault,
		clean,
		copy: publicDir || copy,
		css: resolveCssOptions(css),
		cwd,
		devtools,
		dts,
		entry: resolvedEntry,
		env,
		exports,
		external,
		fixedExtension,
		globImport,
		hash,
		ignoreWatch,
		inlineOnly,
		logger,
		name,
		nameLabel,
		nodeProtocol,
		noExternal,
		outDir,
		pkg,
		platform,
		plugins,
		publint,
		report,
		shims,
		skipNodeModulesBundle,
		sourcemap,
		target,
		treeshake,
		tsconfig,
		unbundle,
		unused,
		watch,
		write
	};
	const objectFormat = typeof format === "object" && !Array.isArray(format);
	return (objectFormat ? Object.keys(format) : resolveComma(toArray(format, "es"))).map((fmt, idx) => {
		const once = idx === 0;
		const overrides = objectFormat ? format[fmt] : void 0;
		return {
			...config,
			copy: once ? config.copy : void 0,
			onSuccess: once ? config.onSuccess : void 0,
			format: normalizeFormat(fmt),
			...overrides
		};
	});
}
/** filter env variables by prefixes */
function filterEnv(envDict, envPrefixes) {
	const env = {};
	for (const [key, value] of Object.entries(envDict)) if (value != null && envPrefixes.some((prefix) => key.startsWith(prefix))) env[key] = value;
	return env;
}
const defu = createDefu((obj, key, value) => {
	if (Array.isArray(obj[key]) && Array.isArray(value)) {
		obj[key] = value;
		return true;
	}
});
function mergeConfig(defaults, overrides) {
	return defu(overrides, defaults);
}
async function mergeUserOptions(defaults, user, args) {
	const userOutputOptions = typeof user === "function" ? await user(defaults, ...args) : user;
	if (!userOutputOptions) return defaults;
	return defu(userOutputOptions, defaults);
}
function resolveFeatureOption(value, defaults) {
	if (typeof value === "object" && value !== null) return resolveCIOption(value.enabled ?? true) ? value : false;
	return resolveCIOption(value) ? defaults : false;
}
function resolveCIOption(value) {
	if (value === "ci-only") return isInCi ? true : false;
	if (value === "local-only") return isInCi ? false : true;
	return value;
}
function filterConfig(filter, configCwd, name) {
	if (!filter) return true;
	let cwd = path.relative(process.cwd(), configCwd);
	if (cwd === "") cwd = ".";
	if (filter instanceof RegExp) return name && filter.test(name) || filter.test(cwd);
	return toArray(filter).some((value) => name && name === value || cwd === value);
}

//#endregion
export { getPackageType as a, cleanChunks as c, loadConfigFile as i, cleanOutDir as l, mergeUserOptions as n, writeExports as o, resolveUserConfig as r, defaultCssBundleName as s, mergeConfig as t };