const __cjs_require = globalThis.process.getBuiltinModule("module").createRequire(import.meta.url);
import { n as tscEmitBuild, t as tscEmitCompiler } from "./emit-compiler-CfQ29zff.mjs";
import { createDebug } from "obug";
const ts = __cjs_require("typescript");

//#region src/tsc/index.ts
const debug = createDebug("rolldown-plugin-dts:tsc");
debug(`loaded typescript: ${ts.version}`);
function tscEmit(tscOptions) {
	debug(`running tscEmit ${tscOptions.id}`);
	if (tscOptions.build) return tscEmitBuild(tscOptions);
	else return tscEmitCompiler(tscOptions);
}

//#endregion
export { tscEmit };