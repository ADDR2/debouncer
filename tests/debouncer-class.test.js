const { expect } = require('chai');
const { createSandbox } = require('sinon');

const validator = require('../validations');
const debouncerGenerator = require('../generator');
const Debouncer = require('../index');

describe('Debouncer class', () => {
    describe('constructor', function() {
        before(() => {
            Sandbox = createSandbox();

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

        it('should initialize all variables and validate params when everything is ok', () => {
            const instance = new Debouncer();

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
    });

    describe('debounce', function() {
        
    });

    describe('shutdownNow', function() {
        
    });

    describe('shutdownAfterCurrentIteration', function() {
        
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