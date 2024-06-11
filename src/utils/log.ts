import chalk from 'chalk';

export const enum LogLevel {
  None = 0,
  Debug = 1,
  Info = 2,
  Warning = 3,
  Error = 4,
  Verbose = 5
}

let logLevel = LogLevel.Verbose;

export function setLogLevel(val: LogLevel): void {
  logLevel = val;
}

export function log(...args: any[]): void {
  console.log(...args);
}

export function logDebug(...args: any[]): void {
  if (logLevel >= LogLevel.Debug) {
    console.log(...args);
  }
}

export function logSuccess(...args: any[]): void {
  if (logLevel >= LogLevel.Debug) {
    console.log(chalk.green('[success]'), ...args);
  }
}

export function logInfo(...args: any[]): void {
  if (logLevel >= LogLevel.Debug) {
    console.log(chalk.cyan('[info]'), ...args);
  }
}

export function logWarn(...args: any[]): void {
  if (logLevel >= LogLevel.Warning) {
    console.log(chalk.bold.yellow('[warn]'), ...args);
  }
}

export function logError(...args: any[]): void {
  if (logLevel >= LogLevel.Error) {
    console.log(chalk.red('[error]'), ...args);
  }
}

export function logFatal(...args: any[]): void {
  if (logLevel >= LogLevel.Error) {
    logError(...args);
    process.exit(1);
  }
}
