export interface Option {
    name: string,
    level: 'info' | 'debug' | 'warn' | 'error',
    dir: string,
    json: boolean,
    filename: string,
    console: boolean,
    writeFile: boolean,
    needErrorFile: boolean,
    autoTraceId: boolean,
    closeFile: boolean,
    datePattern: string
}
