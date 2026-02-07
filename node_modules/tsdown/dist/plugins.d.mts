import { s as ResolvedConfig, v as ReportPlugin, w as TsdownBundle, y as Logger } from "./types-CNIFJKMX.mjs";
import { Plugin } from "rolldown";

//#region src/features/dep.d.ts
declare function DepPlugin({
  pkg,
  noExternal,
  inlineOnly,
  skipNodeModulesBundle,
  logger,
  nameLabel
}: ResolvedConfig): Plugin;
//#endregion
//#region src/features/node-protocol.d.ts
/**
* The `node:` protocol was added in Node.js v14.18.0.
* @see https://nodejs.org/api/esm.html#node-imports
*/
declare function NodeProtocolPlugin(nodeProtocolOption: "strip" | true): Plugin;
//#endregion
//#region src/features/shebang.d.ts
declare function ShebangPlugin(logger: Logger, cwd: string, nameLabel?: string, isDualFormat?: boolean): Plugin;
//#endregion
//#region src/features/watch.d.ts
declare function WatchPlugin(configFiles: string[], {
  config,
  chunks
}: TsdownBundle): Plugin;
//#endregion
export { DepPlugin, NodeProtocolPlugin, ReportPlugin, ShebangPlugin, WatchPlugin };