export interface Option {
    name: string,
    level: 'info' | 'debug' | 'warn' | 'error',
    dir: string,
    filename: string,
    console: boolean,
    writeFile: boolean,
    needErrorFile: boolean,
    autoTraceId: boolean,
    closeFile: boolean,
    datePattern: string
}

export interface AsyncLogger {
    info(...args) :void
    debug(...args) :void
    warn(...args) :void
    error(...args) :void
}
