import { d as BindingReplacePluginConfig } from "./shared/binding-D-XMzSaG.mjs";
import { M as BuiltinPlugin } from "./shared/define-config-U4pj0ZDn.mjs";
import { t as esmExternalRequirePlugin } from "./shared/constructors-KD7LvxpN.mjs";

//#region src/builtin-plugin/replace-plugin.d.ts
/**
* Replaces targeted strings in files while bundling.
*
* @example
* // Basic usage
* ```js
* replacePlugin({
*   'process.env.NODE_ENV': JSON.stringify('production'),
*    __buildVersion: 15
* })
* ```
* @example
* // With options
* ```js
* replacePlugin({
*   'process.env.NODE_ENV': JSON.stringify('production'),
*   __buildVersion: 15
* }, {
*   preventAssignment: false,
* })
* ```
*/
declare function replacePlugin(values?: BindingReplacePluginConfig["values"], options?: Omit<BindingReplacePluginConfig, "values">): BuiltinPlugin;
//#endregion
export { esmExternalRequirePlugin, replacePlugin };