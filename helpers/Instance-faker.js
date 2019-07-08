const Debouncer = require('../index');

function createInstanceWithFakeNext(Sandbox) {
    const instance = new Debouncer();

    instance.generatedDebouncer = {
        next: this.nextSuceeded?
            Sandbox.fake.returns({
                value: this.valueSuceeded? Sandbox.fake() : Sandbox.fake.throws(new Error(this.errorMessage))
            })
        :
            Sandbox.fake.throws(new Error(this.errorMessage))
    };

    return instance;
}

module.exports = { createInstanceWithFakeNext };