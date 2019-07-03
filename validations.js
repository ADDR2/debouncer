function validateTime(time) {
    if (typeof time !== 'number' || isNaN(time) || time <= 0) {
        throw new Error('Invalid time passed, it must be a number greater than 0');
    }
}

function validateCallback(callback) {
    if (typeof callback !== 'function') {
        throw new Error('Invalid callback passed, it must be a function');
    }
}

function validateOptions(options) {
    if (typeof options !== 'object') {
        throw new Error('Invalid options passed, it must be an object');
    }

    if (
        !options.events ||
        !Array.isArray(options.events) ||
        options.events.length !== 7 ||
        options.events.filter(item => typeof item === 'string').length !== 7
    ) {
        throw new Error('Invalid events inside options, events property must be an array of strings with length = 7');
    }
}

function validateParams(time, callback, options) {
    validateTime(time);

    validateCallback(callback);

    validateOptions(options);
}

module.exports = {
    validateTime,
    validateCallback,
    validateOptions,
    validateParams
};