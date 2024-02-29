const colors = {
    Reset: '\x1b[0m',
    Bright: '\x1b[1m',
    Dim: '\x1b[2m',
    Underscore: '\x1b[4m',
    Blink: '\x1b[5m',
    Reverse: '\x1b[7m',
    Hidden: '\x1b[8m',
    fg: {
        Black: '\x1b[30m',
        Red: '\x1b[31m',
        Green: '\x1b[32m',
        Yellow: '\x1b[33m',
        Blue: '\x1b[34m',
        Magenta: '\x1b[35m',
        Cyan: '\x1b[36m',
        White: '\x1b[37m',
        Crimson: '\x1b[38m',
    },
    bg: {
        Black: '\x1b[40m',
        Red: '\x1b[41m',
        Green: '\x1b[42m',
        Yellow: '\x1b[43m',
        Blue: '\x1b[44m',
        Magenta: '\x1b[45m',
        Cyan: '\x1b[46m',
        White: '\x1b[47m',
        Crimson: '\x1b[48m',
    },
};

export function success(...message: string[]): void {
    const msg = [
        [colors.fg.Green, '▶ [SUCCESS]'].join(''),
        ...message,
        colors.Reset,
    ];
    console.log(msg.join(' ').trimStart().replace(/\n/g, '\n            '));
}

export function info(...message: string[]): void {
    const msg = [
        [colors.fg.Blue, '▶ [INFO]   '].join(''),
        ...message,
        colors.Reset,
    ];
    console.info(msg.join(' ').trimStart().replace(/\n/g, '\n            '));
}

export function warning(...message: string[]): void {
    const msg = [
        [colors.fg.Yellow, '▶ [WARNING]'].join(''),
        ...message,
        colors.Reset,
    ];
    console.log(msg.join(' ').trimStart().replace(/\n/g, '\n         '));
}

export function error(...message: string[]): void {
    const msg = [
        [colors.fg.Red, '▶ [ERROR]   '].join(''),
        ...message,
        colors.Reset,
    ];
    console.log(msg.join(' ').trimStart().replace(/\n/g, '\n            '));
}

export function message(...message: string[]): void {
    const msg = [
        [colors.fg.Cyan, '▶ [MESSAGE]'].join(''),
        ...message,
        colors.Reset,
    ];
    console.log(msg.join(' ').trimStart().replace(/\n/g, '\n            '));
}
