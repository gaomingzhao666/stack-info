import { A as OutExtensionFactory, B as CopyOptions, C as RolldownChunk, D as ChunkAddonFunction, E as ChunkAddon, F as RolldownContext, H as Arrayable, I as TsdownHooks, L as DevtoolsOptions, M as PackageJsonWithPath, N as PackageType, O as ChunkAddonObject, P as BuildContext, R as CssOptions, S as ExportsOptions, T as AttwOptions, V as CopyOptionsFn, _ as ReportOptions, a as NoExternalFn, b as globalLogger, c as Sourcemap, d as UnusedOptions, f as UserConfig, g as Workspace, h as WithEnabled, i as InlineConfig, j as OutExtensionObject, k as OutExtensionContext, l as TreeshakingOptions, m as UserConfigFn, n as DtsOptions, o as NormalizedFormat, p as UserConfigExport, r as Format, s as ResolvedConfig, t as CIOption, u as TsdownInputOption, w as TsdownBundle, x as PublintOptions, y as Logger, z as CopyEntry } from "./types-CNIFJKMX.mjs";
import { n as resolveUserConfig, t as mergeConfig } from "./options-DRXBLnH3.mjs";
import { defineConfig } from "./config.mjs";
import * as Rolldown from "rolldown";

//#region src/build.d.ts
/**
* Build with tsdown.
*/
declare function build(inlineConfig?: InlineConfig): Promise<TsdownBundle[]>;
/**
* Build with `ResolvedConfigs`.
*
* **Internal API, not for public use**
* @private
*/
declare function buildWithConfigs(configs: ResolvedConfig[], configFiles: string[], _restart: () => void): Promise<TsdownBundle[]>;
//#endregion
//#region src/features/debug.d.ts
declare function enableDebug(debug?: boolean | Arrayable<string>): void;
//#endregion
export { AttwOptions, BuildContext, CIOption, ChunkAddon, ChunkAddonFunction, ChunkAddonObject, CopyEntry, CopyOptions, CopyOptionsFn, CssOptions, DevtoolsOptions, DtsOptions, ExportsOptions, Format, InlineConfig, type Logger, NoExternalFn, NormalizedFormat, OutExtensionContext, OutExtensionFactory, OutExtensionObject, PackageJsonWithPath, PackageType, PublintOptions, ReportOptions, ResolvedConfig, Rolldown, RolldownChunk, RolldownContext, Sourcemap, TreeshakingOptions, TsdownBundle, TsdownHooks, TsdownInputOption, UnusedOptions, UserConfig, UserConfigExport, UserConfigFn, WithEnabled, Workspace, build, buildWithConfigs, defineConfig, enableDebug, globalLogger, mergeConfig, resolveUserConfig };