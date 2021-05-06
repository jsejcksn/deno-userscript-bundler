export type MetaValues = {
  name?: string | (Record<string, string> & {default: string});
  description?: string;
  namespace?: string;

  /**
   * Match pattern:
   * https://developer.chrome.com/docs/extensions/mv3/match_patterns/
   */
  match?: string | string[];
  include?: string | string[];
  exclude?: string | string[];
  icon?: string;
  require?: string;

  /** Default `"document-end"` */
  'run-at'?:
    | 'document-end'
    | 'document-start'
    | 'document-idle'
    | 'document-body' /** Only Tampermonkey */
    | 'context-menu'; /** Only Tampermonkey, only Chrome */

  /** Values are URIs */
  resource?: Record<string, string>;

  /** SemVer: https://semver.org/ */
  version?: string;
  noframes?: true;
  grant?: string | string[];
};

export type Options = {

  /** Default `"./metablock.json"` */
  file?: string;

  /** Default `"compatible"` */
  manager?:
    | 'compatible'
    | 'greasemonkey3'
    | 'greasemonkey4'
    | 'tampermonkey'
    | 'violentmonkey';

  order?: string[];

  /** Default `null` */
  override?: MetaValues;
  validator?: 'off' | 'warn' | 'error';
};

declare function metablock (options?: Options): string;
export default metablock;

/**
 * This function constructs and validates metablock entries according to the
 * options provided. By returning an entries array, the user has an opportunity
 * to make manual edits to the entries before converting the array to a
 * formatted metablock string using `entries.toString()`.
 */
export declare function getMetablockEntries (options?: Options): (
  | [key: string, value: string]
  | [key: string]
)[];
