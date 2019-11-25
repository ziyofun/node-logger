export interface Option {
    name: string;
    level: 'info' | 'debug' | 'warn' | 'error';
    dir: string;
    filename: string;
    console: boolean;
    writeFile: boolean;
    needErrorFile: boolean;
    autoTraceId: boolean;
    closeFile: boolean;
    datePattern: string;
}
export interface AsyncLogger {
    info(): void;
    debug(): void;
    warn(): void;
    error(): void;
}
