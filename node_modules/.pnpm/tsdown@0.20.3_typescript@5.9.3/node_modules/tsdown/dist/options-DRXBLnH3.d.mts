import { f as UserConfig, i as InlineConfig, s as ResolvedConfig } from "./types-CNIFJKMX.mjs";

//#region src/config/options.d.ts
/**
* Resolve user config into resolved configs
*
* **Internal API, not for public use**
* @private
*/
declare function resolveUserConfig(userConfig: UserConfig, inlineConfig: InlineConfig): Promise<ResolvedConfig[]>;
declare function mergeConfig(defaults: UserConfig, overrides: UserConfig): UserConfig;
declare function mergeConfig(defaults: InlineConfig, overrides: InlineConfig): InlineConfig;
//#endregion
export { resolveUserConfig as n, mergeConfig as t };