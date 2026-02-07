import { TscContext } from "./tsc-context.mjs";
import { SourceMapInput } from "rolldown";
import { TsConfigJson } from "get-tsconfig";
import ts from "typescript";

//#region src/tsc/types.d.ts
interface TscModule {
  program: ts.Program;
  file: ts.SourceFile;
}
interface TscOptions {
  tsconfig?: string;
  tsconfigRaw: TsConfigJson;
  cwd: string;
  build: boolean;
  incremental: boolean;
  entries?: string[];
  id: string;
  sourcemap: boolean;
  vue?: boolean;
  tsMacro?: boolean;
  context?: TscContext;
}
interface TscResult {
  code?: string;
  map?: SourceMapInput;
  error?: string;
}
//#endregion
export { TscOptions as n, TscResult as r, TscModule as t };