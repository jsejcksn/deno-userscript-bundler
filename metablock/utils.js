// import chalk from 'chalk';
import { isUri } from './deps.js';

export const jclone = (o) => JSON.parse(JSON.stringify(o));
export const isString = (v) => typeof(v) === 'string';
export const isObject = (v) => typeof(v) === 'object' && v !== null;
export const isMatchPattern = (s) => /^([*]|https?|file|ftp):\/\/([*]|(?:\*\.)?[^*/]*)\/.*$/u.test(s);
export const isGlobURI = (s) => (/^\/.*\/$/).test(s) || Boolean(isUri(s)) || (isString(s) && s.includes('*'));
export const isIPv4 = (s) => {
  if (/^\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}$/.test(s)) {
    return s.split('.').filter(Boolean).map((t) => parseInt(t)).every((n) => n >= 0 && n <= 255);
  }
  return false;
};
const noop = () => {};
// const isTestEnv = process.env.NODE_ENV === 'test';

export const print = {
  // warn: !isTestEnv ? console.warn.bind(console, chalk.yellow('⚠')) : noop,
  warn: noop,
};
