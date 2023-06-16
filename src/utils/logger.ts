import { log, logDebug, logSuccess, logInfo, logWarn, logError, logFatal, LogLevel, setLogLevel } from './log.js';

export class Logger {
  public static set level(level: LogLevel) {
    setLogLevel(level);
  }

  public static debug(...args: any[]): void {
    logDebug(...args);
  }

  public static print(...args: any[]): void {
    log(...args);
  }

  public static success(...args: any[]): void {
    logSuccess(...args);
  }

  public static info(...args: any[]): void {
    logInfo(...args);
  }

  public static warn(...args: any[]): void {
    logWarn(...args);
  }

  public static error(...args: any[]): void {
    logError(...args);
  }

  public static fatal(...args: any[]): void {
    logFatal(...args);
  }

  public static newline(): void {
    console.log();
  }
}
