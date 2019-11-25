/**
 * @description 打印log基础组件
 */
import CLS from 'cls-hooked';
import { Option, AsyncLogger } from '../type';
export declare function createLogger(options: Option): (moduleName?: string) => AsyncLogger;
export declare const writer: CLS.Namespace;
export declare function getTraceId(): any;
export declare function genTraceId(): string;
export declare function setTraceId(traceId: string): string;
