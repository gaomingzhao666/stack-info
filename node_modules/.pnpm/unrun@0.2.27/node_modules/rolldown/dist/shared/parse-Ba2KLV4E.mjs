import { n as __toESM, t as require_binding } from "./binding-DuOSzYPt.mjs";

//#region ../../node_modules/.pnpm/oxc-parser@0.112.0/node_modules/oxc-parser/src-js/wrap.js
function wrap(result) {
	let program, module, comments, errors;
	return {
		get program() {
			if (!program) program = jsonParseAst(result.program);
			return program;
		},
		get module() {
			if (!module) module = result.module;
			return module;
		},
		get comments() {
			if (!comments) comments = result.comments;
			return comments;
		},
		get errors() {
			if (!errors) errors = result.errors;
			return errors;
		}
	};
}
function jsonParseAst(programJson) {
	const { node: program, fixes } = JSON.parse(programJson);
	for (const fixPath of fixes) applyFix(program, fixPath);
	return program;
}
function applyFix(program, fixPath) {
	let node = program;
	for (const key of fixPath) node = node[key];
	if (node.bigint) node.value = BigInt(node.bigint);
	else try {
		node.value = RegExp(node.regex.pattern, node.regex.flags);
	} catch {}
}

//#endregion
//#region src/utils/parse.ts
var import_binding = /* @__PURE__ */ __toESM(require_binding(), 1);
/**
* Parse asynchronously.
*
* Note: This function can be slower than `parseSync` due to the overhead of spawning a thread.
*/
async function parse(filename, sourceText, options) {
	return wrap(await (0, import_binding.parse)(filename, sourceText, options));
}
/** Parse synchronously. */
function parseSync(filename, sourceText, options) {
	return wrap((0, import_binding.parseSync)(filename, sourceText, options));
}

//#endregion
export { parseSync as n, parse as t };