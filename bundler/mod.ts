import {emitOptions} from './options.ts';
export {baseCompilerOptions, browserCompilerOptions} from './options.ts';

export type BundleOptions = {

  /** Default: `"module"` */
  bundleType?: Deno.EmitOptions['bundle'];

  /**
   * TypeScript compiler options used by Deno. If not provided, a set of default
   * options will be used, targeted for a browser and ESNext features
   */
  compilerOptions?: Deno.CompilerOptions;

  /**
   * String to prepend to the module text. If provided, a newline will be
   * automatically inserted after the string.
   */
  header?: string;

  /**
   * Print any compilation diagnostic messages to the console. Default: `false`
   */
  logDiagnostics?: boolean;
};

export type BundleResult = {
  bundle: string;
  result: Deno.EmitResult;
};

export async function bundleModule (
  entrypointPath: string,
  options?: BundleOptions,
): Promise<BundleResult> {
  const result = await Deno.emit(entrypointPath, {
    bundle: options?.bundleType ?? emitOptions.bundle,
    compilerOptions: options?.compilerOptions ?? emitOptions.compilerOptions,
  });

  if (options?.logDiagnostics) {
    if (result.ignoredOptions?.length) {
      let message = 'Ignored options:\n';
      message += result.ignoredOptions.map(str => `  ${str}`).join('\n');
      console.warn(message);
    }
    if (result.diagnostics.length) {
      console.warn(Deno.formatDiagnostics(result.diagnostics));
    }
  }

  // https://deno.land/manual@v1.9.2/typescript/runtime#bundling
  let bundle = result.files['deno:///bundle.js'];

  if (options?.header) bundle = `${options.header}\n${bundle}`;

  return {bundle, result};
}
