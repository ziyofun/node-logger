import { Option, AsyncLogger } from "../type";
/**
 * require('./log')(name)
 *
 * @return {Function} log
 */
export declare function Logger(options: Option): (name: string) => AsyncLogger;
export { genTraceId, getTraceId, setTraceId, writer as ns } from './baseLogger';
