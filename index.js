const EventEmitter = require('events');

const debouncerGenerator = require('./generator');
const validator = require('./validations');

const baseOptions = {
    nullIterationsToShutdown: 3,
    onlyCountContiguousIterations: true,
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
    constructor(time = 1000, callback = () => {}, options = {}) {
        super();

        const paramOptions = { ...baseOptions, ...options };

        validator.validateParams(time, callback, paramOptions);
        this.options = paramOptions;
        this.events = this.options.events;
        this.generatedDebouncer = debouncerGenerator.call(this, time, callback);

        this.on(this.options.events[0], () => this.shutdownNow());
        this.on(this.options.events[1], () => this.shutdownAfterCurrentIteration());
        this.on(this.options.events[5], () => this.reboot());
    }

    debounce(data) {
        this.generatedDebouncer.next().value({ type: 'addData', params: { data } });
    }

    shutdownNow() {
        this.generatedDebouncer.next().value({ type: 'shutdownNow' });
    }

    shutdownAfterCurrentIteration() {
        this.generatedDebouncer.next().value({ type: 'shutdownAfterCurrentIteration' });
    }

    reboot(time = 1000, callback = () => {}, options = {}) {
        const paramOptions = { ...baseOptions, ...options };

        validator.validateParams(time, callback, paramOptions);
        this.shutdownNow();

        this.options = paramOptions;
        this.removeAllListeners(this.options.events[0]);
        this.removeAllListeners(this.options.events[1]);
        this.removeAllListeners(this.options.events[5]);

        this.events = this.options.events;
        this.generatedDebouncer = debouncerGenerator.call(this, time, callback);

        this.on(this.options.events[0], () => this.shutdownNow());
        this.on(this.options.events[1], () => this.shutdownAfterCurrentIteration());
        this.on(this.options.events[5], () => this.reboot());
    }

    changeTime(newTime = 1000) {
        validator.validateTime(newTime);

        this.generatedDebouncer.next().value({ type: 'changeTime', params: { newTime } });
    }

    changeCallback(newCallback = () => {}) {
        validator.validateCallback(newCallback);

        this.generatedDebouncer.next().value({ type: 'changeCallback', params: { newCallback } });
    }

    changeOptions(newOptions = {}) {
        const paramOptions = { ...baseOptions, ...newOptions };

        validator.validateOptions(paramOptions);

        this.options = paramOptions;
        this.removeAllListeners(this.options.events[0]);
        this.removeAllListeners(this.options.events[1]);
        this.removeAllListeners(this.options.events[5]);

        this.events = this.options.events;

        this.on(this.options.events[0], () => this.shutdownNow());
        this.on(this.options.events[1], () => this.shutdownAfterCurrentIteration());
        this.on(this.options.events[5], () => this.reboot());
    }

}

module.exports = Debouncer;