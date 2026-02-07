import { tscEmit } from "./tsc.mjs";

//#region src/tsc/worker.d.ts
declare const functions: {
  tscEmit: typeof tscEmit;
};
type TscFunctions = typeof functions;
//#endregion
export { TscFunctions };