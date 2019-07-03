const { isEqual, cloneDeep } = require('lodash');

function* debouncerGenerator(instanceTime, instanceCallback) {
    let time = instanceTime;
    let callback = instanceCallback;
    let shutdown = false;
    let timer = null;
    let lastData = null;
    let currentData = null;
    let firstTime = true;
    let nullIterations = 0;
    
    const recursiveTimer = () => {
        timer = setTimeout(
            async () => {
                try {
                    if (!isEqual(currentData, lastData)) {
                        this.emit(this.events[3]);

                        lastData = cloneDeep(currentData);
                        nullIterations && this.options.onlyCountContiguosIterations && (nullIterations = 0);
                        this.emit(this.events[6], await callback(currentData));
                    } else {
                        this.emit(this.events[4]);
                        nullIterations++;
                    }
                } catch(error) {
                    this.emit(this.events[2], error);

                    this.options.shutdownAfterError && (shutdown = true);
                } finally {
                    shutdown && clearTimeout(timer);
                    this.options.nullIterationsToShutdown && this.options.nullIterationsToShutdown === nullIterations && clearTimeout(timer);
                }
            },
            time
        );
    };

    while(!shutdown) {
        yield (data, shutdownNow, changes = {}) => {
            if (shutdownNow) {
                timer && clearTimeout(timer);
                shutdown = true;

                return false;
            }

            if (changes.newTime) time = changes.newTime;
            if (changes.newCallback) callback = changes.newCallback;
            if (changes.shutdownAfterCurrentIteration) shutdown = true;

            data !== undefined && (currentData = data);
            firstTime && recursiveTimer();
            firstTime = false;

            return true;
        };
    }

    yield () => false;
}

module.exports = debouncerGenerator;