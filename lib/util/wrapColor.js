module.exports = function wrapColor(message, color) {
    return `${color.open}${message}${color.close}`;
}