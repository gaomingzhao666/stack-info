import { n as __toESM, t as require_binding } from "./shared/binding-DuOSzYPt.mjs";
import { n as onExit, t as watch } from "./shared/watch-CYYWTpJG.mjs";
import "./shared/normalize-string-or-regex-DeZqg15i.mjs";
import { C as RUNTIME_MODULE_ID, w as VERSION } from "./shared/bindingify-input-options-CorDub0q.mjs";
import "./shared/rolldown-build-CGNuOAoF.mjs";
import "./shared/parse-Ba2KLV4E.mjs";
import { t as rolldown } from "./shared/rolldown-Cid7Amwd.mjs";
import { t as defineConfig } from "./shared/define-config-BVG4QvnP.mjs";
import { isMainThread } from "node:worker_threads";

//#region src/setup.ts
var import_binding = /* @__PURE__ */ __toESM(require_binding(), 1);
if (isMainThread) {
	const subscriberGuard = (0, import_binding.initTraceSubscriber)();
	onExit(() => {
		subscriberGuard?.close();
	});
}

//#endregion
//#region src/api/build.ts
/**
* The API similar to esbuild's `build` function.
*
* @example
* ```js
* import { build } from 'rolldown';
*
* const result = await build({
*   input: 'src/main.js',
*   output: {
*     file: 'bundle.js',
*   },
* });
* console.log(result);
* ```
*
* @experimental
* @category Programmatic APIs
*/
async function build(options) {
	if (Array.isArray(options)) return Promise.all(options.map((opts) => build(opts)));
	else {
		const { output, write = true, ...inputOptions } = options;
		const build = await rolldown(inputOptions);
		try {
			if (write) return await build.write(output);
			else return await build.generate(output);
		} finally {
			await build.close();
		}
	}
}

//#endregion
var BindingMagicString = import_binding.BindingMagicString;
export { BindingMagicString, RUNTIME_MODULE_ID, VERSION, build, defineConfig, rolldown, watch };