import { f as UserConfig, m as UserConfigFn, p as UserConfigExport } from "./types-CNIFJKMX.mjs";
import { t as mergeConfig } from "./options-DRXBLnH3.mjs";

//#region src/config.d.ts
/**
* Defines the configuration for tsdown.
*/
declare function defineConfig(options: UserConfig): UserConfig;
declare function defineConfig(options: UserConfig[]): UserConfig[];
declare function defineConfig(options: UserConfigFn): UserConfigFn;
declare function defineConfig(options: UserConfigExport): UserConfigExport;
//#endregion
export { type UserConfig, type UserConfigExport, type UserConfigFn, defineConfig, mergeConfig };