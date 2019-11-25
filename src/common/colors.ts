export const COLORS = {
    reset: {
        open: '\u001b[0m',
        close: '\u001b[0m'
    },
    bold: {
        open: '\u001b[1m',
        close: '\u001b[22m'
    },
    dim: {
        open: '\u001b[2m',
        close: '\u001b[22m'
    },
    italic: {
        open: '\u001b[3m',
        close: '\u001b[23m'
    },
    underline: {
        open: '\u001b[4m',
        close: '\u001b[24m'
    },
    inverse: {
        open: '\u001b[7m',
        close: '\u001b[27m'
    },
    hidden: {
        open: '\u001b[8m',
        close: '\u001b[28m'
    },
    strikethrough: {
        open: '\u001b[9m',
        close: '\u001b[29m'
    },
    black: {
        open: '\u001b[30m',
        close: '\u001b[39m'
    },
    red: {
        open: '\u001b[31m',
        close: '\u001b[39m'
    },
    green: {
        open: '\u001b[32m',
        close: '\u001b[39m'
    },
    yellow: {
        open: '\u001b[33m',
        close: '\u001b[39m'
    },
    blue: {
        open: '\u001b[34m',
        close: '\u001b[39m'
    },
    magenta: {
        open: '\u001b[35m',
        close: '\u001b[39m'
    },
    cyan: {
        open: '\u001b[36m',
        close: '\u001b[39m'
    },
    white: {
        open: '\u001b[37m',
        close: '\u001b[39m'
    },
    gray: {
        open: '\u001b[90m',
        close: '\u001b[39m'
    },
    grey: {
        open: '\u001b[90m',
        close: '\u001b[39m'
    }
}

export const LEVELS = {
    VERBOSE: {
        level: 4,
        string: 'VERBOSE',
        color: 'gray'
    },
    DEBUG: {
        level: 3,
        string: 'DEBUG',
        color: 'green'
    },
    INFO: {
        level: 2,
        string: 'INFO',
        color: 'cyan'
    },
    WARNING: {
        level: 1,
        string: 'WARNING',
        color: 'yellow'
    },
    WARN: {
        level: 1,
        string: 'WARNING',
        color: 'yellow'
    },
    ERROR: {
        level: 0,
        string: 'ERROR',
        color: 'red'
    }
}