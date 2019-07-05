const { isEqual, cloneDeep } = require('lodash');

function* debouncerGenerator(instanceTime, instanceCallback) {
    let time = instanceTime;
    let callback = instanceCallback;
    let shutdown = false;
    let timer = null;
    let lastData;
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
                    !shutdown && recursiveTimer();
                    shutdown && clearTimeout(timer);
                    this.options.nullIterationsToShutdown && this.options.nullIterationsToShutdown === nullIterations && clearTimeout(timer);
                }
            },
            time
        );
    };

    while(!shutdown) {
        yield ({ type, params }) => {
            switch(type) {
                case 'shutdownNow':
                    timer && clearTimeout(timer);
                    shutdown = true;
    
                    return false;
                case 'addData':
                    currentData = params.data;
                    firstTime && recursiveTimer();
                    firstTime = false;

                    return true;

                case 'shutdownAfterCurrentIteration':
                    shutdown = true;
                    firstTime && recursiveTimer();
                    firstTime = false;

                    return true;

                case 'changeTime':
                    time = params.newTime;

                    return true;
                case 'changeCallback':
                    callback = params.newCallback;

                    return true;
            }
        };
    }

    yield () => false;
}

module.exports = debouncerGenerator;