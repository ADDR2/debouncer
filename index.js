const EventEmitter = require('events');

const debouncerGenerator = require('./generator');
const {
    validateTime,
    validateCallback,
    validateOptions,
    validateParams
} = require('./validations');

const baseOptions = {
    nullIterationsToShutdown: 3,
    onlyCountContiguosIterations: true,
    shutdownAfterError: true,
    events: [
        'shutdown',
        'shutdownAfterCurrentIteration',
        'errorInCurrentIteration',
        'activeIteration',
        'nullIteration',
        'reboot',
        'responseFromCallback'
    ]
};

class Debouncer extends EventEmitter {
    constructor(time = 1000, callback = () => {}, options = baseOptions) {
        super();

        validateParams(time, callback, options);
        this.options = options;
        this.events = this.options.events;
        this.generatedDebouncer = debouncerGenerator.call(this, time, callback);

        this.on(this.options.events[0], () => this.shutdownNow());
        this.on(this.options.events[1], () => this.shutdownAfterCurrentIteration());
        this.on(this.options.events[5], () => this.reboot());
    }

    debounce(data) {
        this.generatedDebouncer.next().value(data);
    }

    shutdownNow() {
        this.generatedDebouncer.next().value(undefined, true);
    }

    shutdownAfterCurrentIteration() {
        this.generatedDebouncer.next().value(undefined, false, { shutdownAfterCurrentIteration: true });
    }

    reboot(time = 1000, callback = () => {}, options = baseOptions) {
        validateParams(time, callback, options);
        this.generatedDebouncer.next().value(undefined, true);

        this.options = options;
        this.events = this.options.events;
        this.generatedDebouncer = debouncerGenerator.call(this, time, callback);
    }

    changeTime(newTime = 1000) {
        validateTime(newTime);

        this.generatedDebouncer.next().value(undefined, false, { newTime });
    }

    changeCallback(newCallback = () => {}) {
        validateCallback(newCallback);

        this.generatedDebouncer.next().value(undefined, false, { newCallback });
    }

    changeOptions(newOptions = baseOptions) {
        validateOptions(newOptions);

        this.options = newOptions
        this.events = this.options.events;
    }

}

module.exports = Debouncer;