import { a as RolldownLog } from "./shared/logging-CE90D8JR.mjs";

//#region src/get-log-filter.d.ts
type GetLogFilter = (filters: string[]) => (log: RolldownLog) => boolean;
declare const getLogFilter: GetLogFilter;
//#endregion
export { GetLogFilter, type RolldownLog, type RolldownLog as RollupLog, getLogFilter as default };