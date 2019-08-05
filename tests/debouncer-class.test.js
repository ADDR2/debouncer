const { expect } = require('chai');
const { createSandbox } = require('sinon');
const Sandbox = createSandbox();

const validator = require('../validations');
const debouncerGenerator = require('../generator');
const Debouncer = require('../index');

const { createInstanceWithFakeNext } = require('../helpers/Instance-faker');

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

describe('Debouncer class', () => {
    describe('constructor', function() {
        before(() => {
            this.validateParamsSucceeded = true;
            this.errorMessage = 'The Error';
            this.validateParamsStub = Sandbox.stub(validator, 'validateParams').callsFake(() => {
                if (!this.validateParamsSucceeded) {
                    throw new Error(this.errorMessage);
                }
            });

            this.generatorCallSucceeded = true;
            this.generatorCallStub = Sandbox.stub(debouncerGenerator, 'call').callsFake(() => {
                if (!this.generatorCallSucceeded) {
                    throw new Error(this.errorMessage);
                }
            });
        });

        afterEach(() => {
            this.validateParamsSucceeded = true;
            this.generatorCallSucceeded = true;
            this.validateParamsStub.resetHistory();
            this.generatorCallStub.resetHistory();
        });

        after(() => {
            this.validateParamsStub.restore();
            this.generatorCallStub.restore();
        });

        it('should initialize all variables and validate params when everything is ok', () => {
            const instance = new Debouncer();

            // Stub assertions
            const { args } = this.validateParamsStub.getCall(0);
            const [ time, callback, options ] = args;

            expect(this.validateParamsStub.callCount).to.eq(1);
            expect(args.length).to.eq(3);
            expect(time).to.deep.eq(1000);
            expect(callback).to.be.a('function');
            expect(options).to.deep.eq(baseOptions);

            // Options assertions
            expect(baseOptions).to.deep.eq(instance.options);
            expect(instance.events).to.deep.eq(baseOptions.events);

            // Generator assertions
            const { args: generatorArgs } = this.generatorCallStub.getCall(0);
            const [ scope, generatorTime, generatorCallback ] = generatorArgs;

            expect(this.generatorCallStub.callCount).to.eq(1);
            expect(generatorArgs.length).to.eq(3);
            expect(scope).to.deep.eq(instance);
            expect(generatorTime).to.eq(time);
            expect(generatorCallback).to.be.a('function');
            expect(generatorCallback).to.deep.eq(callback);

            // Listeners assertions
            expect(instance.eventNames()).to.deep.eq([
                baseOptions.events[0],
                baseOptions.events[1],
                baseOptions.events[5]
            ]);
            expect(instance.listenerCount(baseOptions.events[0])).to.eq(1);
            expect(instance.listenerCount(baseOptions.events[1])).to.eq(1);
            expect(instance.listenerCount(baseOptions.events[5])).to.eq(1);
        });

        it('should mix options with base options and should keep the same behavior', () => {
            const paramOptions = {
                shutdownAfterError: false,
                events: [ '1', '2', '3', '4', '5', '6', '7' ]
            };

            const instance = new Debouncer(undefined, undefined, paramOptions);

            // Stub assertions
            const { args } = this.validateParamsStub.getCall(0);
            const [ time, callback, options ] = args;
            const mixedOptions = { ...baseOptions, ...paramOptions };

            expect(this.validateParamsStub.callCount).to.eq(1);
            expect(args.length).to.eq(3);
            expect(time).to.deep.eq(1000);
            expect(callback).to.be.a('function');
            expect(options).to.deep.eq(mixedOptions);

            // Options assertions
            expect(mixedOptions).to.deep.eq(instance.options);
            expect(instance.events).to.deep.eq(mixedOptions.events);

            // Generator assertions
            const { args: generatorArgs } = this.generatorCallStub.getCall(0);
            const [ scope, generatorTime, generatorCallback ] = generatorArgs;

            expect(this.generatorCallStub.callCount).to.eq(1);
            expect(generatorArgs.length).to.eq(3);
            expect(scope).to.deep.eq(instance);
            expect(generatorTime).to.eq(time);
            expect(generatorCallback).to.be.a('function');
            expect(generatorCallback).to.deep.eq(callback);

            // Listeners assertions
            expect(instance.eventNames()).to.deep.eq([
                mixedOptions.events[0],
                mixedOptions.events[1],
                mixedOptions.events[5]
            ]);
            expect(instance.listenerCount(mixedOptions.events[0])).to.eq(1);
            expect(instance.listenerCount(mixedOptions.events[1])).to.eq(1);
            expect(instance.listenerCount(mixedOptions.events[5])).to.eq(1);
        });

        it('should keep the time and callback passed as parameters', () => {
            const paramOptions = {
                shutdownAfterError: false,
                events: [ '1', '2', '3', '4', '5', '6', '7' ]
            };

            const myCallback = () => {};
            const myTime = 3000;

            const instance = new Debouncer(myTime, myCallback, paramOptions);

            // Stub assertions
            const { args } = this.validateParamsStub.getCall(0);
            const [ time, callback, options ] = args;
            const mixedOptions = { ...baseOptions, ...paramOptions };

            expect(this.validateParamsStub.callCount).to.eq(1);
            expect(args.length).to.eq(3);
            expect(time).to.deep.eq(myTime);
            expect(callback).to.be.a('function');
            expect(callback).to.deep.eq(myCallback);
            expect(options).to.deep.eq(mixedOptions);

            // Generator assertions
            const { args: generatorArgs } = this.generatorCallStub.getCall(0);
            const [ scope, generatorTime, generatorCallback ] = generatorArgs;

            expect(this.generatorCallStub.callCount).to.eq(1);
            expect(generatorArgs.length).to.eq(3);
            expect(scope).to.deep.eq(instance);
            expect(generatorTime).to.eq(myTime);
            expect(generatorCallback).to.be.a('function');
            expect(generatorCallback).to.deep.eq(myCallback);
        });

        it('should throw error when validateParams fails', () => {
            this.validateParamsSucceeded = false;
            let errorThrown = false;

            try {
                new Debouncer();
            } catch(error) {
                errorThrown = true;

                // Error assertions
                expect(error).to.be.an.instanceOf(Error);
                expect(error.message).to.eq(this.errorMessage);

                // Stub assertions
                const { args } = this.validateParamsStub.getCall(0);
                const [ time, callback, options ] = args;

                expect(this.validateParamsStub.callCount).to.eq(1);
                expect(args.length).to.eq(3);
                expect(time).to.deep.eq(1000);
                expect(callback).to.be.a('function');
                expect(options).to.deep.eq(baseOptions);

                // Generator assertions
                expect(this.generatorCallStub.callCount).to.eq(0);
            } finally {
                expect(errorThrown).to.eq(true);
            }
        });

        it('should throw error when debouncerGenerator.call fails', () => {
            this.generatorCallSucceeded = false;
            let errorThrown = false;

            try {
                new Debouncer();
            } catch(error) {
                errorThrown = true;

                // Error assertions
                expect(error).to.be.an.instanceOf(Error);
                expect(error.message).to.eq(this.errorMessage);

                // Stub assertions
                const { args } = this.validateParamsStub.getCall(0);
                const [ time, callback, options ] = args;

                expect(this.validateParamsStub.callCount).to.eq(1);
                expect(args.length).to.eq(3);
                expect(time).to.deep.eq(1000);
                expect(callback).to.be.a('function');
                expect(options).to.deep.eq(baseOptions);

                // Generator assertions
                const { args: generatorArgs } = this.generatorCallStub.getCall(0);
                const [ scope, generatorTime, generatorCallback ] = generatorArgs;

                expect(this.generatorCallStub.callCount).to.eq(1);
                expect(generatorArgs.length).to.eq(3);
                expect(generatorTime).to.eq(time);
                expect(generatorCallback).to.be.a('function');
                expect(generatorCallback).to.deep.eq(callback);
            } finally {
                expect(errorThrown).to.eq(true);
            }
        });
    });

    describe('debounce', function() {
        before(() => {
            this.valueSuceeded = true;
            this.nextSuceeded = true;
            this.errorMessage = 'The Error';
        });

        afterEach(() => {
            this.valueSuceeded = true;
            this.nextSuceeded = true;
            this.errorMessage = 'The Error';
        });

        it('should call next function when everything is ok', () => {
            const instance = createInstanceWithFakeNext.call(this, Sandbox);
            const data = { empty: 'something random' };

            instance.debounce(data);

            expect(instance.generatedDebouncer.next.callCount).to.eq(1);
            expect(instance.generatedDebouncer.next.getCall(0).args).to.deep.eq([]);
            expect(instance.generatedDebouncer.next().value.callCount).to.eq(1);
            expect(instance.generatedDebouncer.next().value.getCall(0).args).to.deep.eq([ { type: 'addData', params: { data } } ]);
        });

        it('should throw error when next function throws', () => {
            this.nextSuceeded = false;
            let errorThrown = false;

            const instance = createInstanceWithFakeNext.call(this, Sandbox);

            try {
                instance.debounce({ empty: 'something random' });
            } catch(error) {
                errorThrown = true;

                // Error assertions
                expect(error).to.be.an.instanceOf(Error);
                expect(error.message).to.eq(this.errorMessage);

                // Instance assertions
                expect(instance.generatedDebouncer.next.callCount).to.eq(1);
            } finally {
                expect(errorThrown).to.eq(true);
            }
        });

        it('should throw error when value function throws', () => {
            this.valueSuceeded = false;
            let errorThrown = false;

            const instance = createInstanceWithFakeNext.call(this, Sandbox);

            try {
                instance.debounce({ empty: 'something random' });
            } catch(error) {
                errorThrown = true;

                // Error assertions
                expect(error).to.be.an.instanceOf(Error);
                expect(error.message).to.eq(this.errorMessage);

                // Instance assertions
                expect(instance.generatedDebouncer.next.callCount).to.eq(1);
                expect(instance.generatedDebouncer.next().value.callCount).to.eq(1);
            } finally {
                expect(errorThrown).to.eq(true);
            }
        });
    });

    describe('shutdownNow', function() {
        before(() => {
            this.valueSuceeded = true;
            this.nextSuceeded = true;
            this.errorMessage = 'The Error';
        });

        afterEach(() => {
            this.valueSuceeded = true;
            this.nextSuceeded = true;
            this.errorMessage = 'The Error';
        });

        it('should call next function when everything is ok', () => {
            const instance = createInstanceWithFakeNext.call(this, Sandbox);

            instance.shutdownNow();

            expect(instance.generatedDebouncer.next.callCount).to.eq(1);
            expect(instance.generatedDebouncer.next.getCall(0).args).to.deep.eq([]);
            expect(instance.generatedDebouncer.next().value.callCount).to.eq(1);
            expect(instance.generatedDebouncer.next().value.getCall(0).args).to.deep.eq([ { type: 'shutdownNow' } ]);
        });

        it('should throw error when next function throws', () => {
            this.nextSuceeded = false;
            let errorThrown = false;

            const instance = createInstanceWithFakeNext.call(this, Sandbox);

            try {
                instance.shutdownNow();
            } catch(error) {
                errorThrown = true;

                // Error assertions
                expect(error).to.be.an.instanceOf(Error);
                expect(error.message).to.eq(this.errorMessage);

                // Instance assertions
                expect(instance.generatedDebouncer.next.callCount).to.eq(1);
            } finally {
                expect(errorThrown).to.eq(true);
            }
        });

        it('should throw error when value function throws', () => {
            this.valueSuceeded = false;
            let errorThrown = false;

            const instance = createInstanceWithFakeNext.call(this, Sandbox);

            try {
                instance.shutdownNow();
            } catch(error) {
                errorThrown = true;

                // Error assertions
                expect(error).to.be.an.instanceOf(Error);
                expect(error.message).to.eq(this.errorMessage);

                // Instance assertions
                expect(instance.generatedDebouncer.next.callCount).to.eq(1);
                expect(instance.generatedDebouncer.next().value.callCount).to.eq(1);
            } finally {
                expect(errorThrown).to.eq(true);
            }
        });
    });

    describe('shutdownAfterCurrentIteration', function() {
        before(() => {
            this.valueSuceeded = true;
            this.nextSuceeded = true;
            this.errorMessage = 'The Error';
        });

        afterEach(() => {
            this.valueSuceeded = true;
            this.nextSuceeded = true;
            this.errorMessage = 'The Error';
        });

        it('should call next function when everything is ok', () => {
            const instance = createInstanceWithFakeNext.call(this, Sandbox);

            instance.shutdownAfterCurrentIteration();

            expect(instance.generatedDebouncer.next.callCount).to.eq(1);
            expect(instance.generatedDebouncer.next.getCall(0).args).to.deep.eq([]);
            expect(instance.generatedDebouncer.next().value.callCount).to.eq(1);
            expect(instance.generatedDebouncer.next().value.getCall(0).args).to.deep.eq([ { type: 'shutdownAfterCurrentIteration' } ]);
        });

        it('should throw error when next function throws', () => {
            this.nextSuceeded = false;
            let errorThrown = false;

            const instance = createInstanceWithFakeNext.call(this, Sandbox);

            try {
                instance.shutdownAfterCurrentIteration();
            } catch(error) {
                errorThrown = true;

                // Error assertions
                expect(error).to.be.an.instanceOf(Error);
                expect(error.message).to.eq(this.errorMessage);

                // Instance assertions
                expect(instance.generatedDebouncer.next.callCount).to.eq(1);
            } finally {
                expect(errorThrown).to.eq(true);
            }
        });

        it('should throw error when value function throws', () => {
            this.valueSuceeded = false;
            let errorThrown = false;

            const instance = createInstanceWithFakeNext.call(this, Sandbox);

            try {
                instance.shutdownAfterCurrentIteration();
            } catch(error) {
                errorThrown = true;

                // Error assertions
                expect(error).to.be.an.instanceOf(Error);
                expect(error.message).to.eq(this.errorMessage);

                // Instance assertions
                expect(instance.generatedDebouncer.next.callCount).to.eq(1);
                expect(instance.generatedDebouncer.next().value.callCount).to.eq(1);
            } finally {
                expect(errorThrown).to.eq(true);
            }
        });
    });

    describe('reboot', function() {
        
    });

    describe('changeTime', function() {
        
    });

    describe('changeCallback', function() {
        
    });

    describe('changeOptions', function() {
        
    });
});