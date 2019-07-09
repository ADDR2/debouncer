# Debouncer

This library provides a class that creates a recursive timer. You can specify the time and a callback to be executed after that time.
The instance won't start the timer unless you call the right function. It also provides several events to help you trace your code.

## How to use it

There are many things you can do with this library, but I'll begin explaning the basic usage.

First you need to create an instance of the Debouncer, then you'll be able to start the timer and the timer won't stop until some conditions are satisfied.
In short, this Debouncer is like a `setInterval` but every iteration waits for the execution of your callback (and also has other cool options).

```js
const Debouncer = require('@addr/debouncer');

const instance = new Debouncer(
    4000,
    myData => console.log("I'm being executed after 4s with", myData)
);

instance.debounce('My data');

// After 4 seconds your callback will be executed
// The timer will still be running but after 8 seconds it won't execute your callback
// It won't execute it because the data has not changed
// The purpose of this debouncer is that you can change your data as many times as you want, but it will be processed
// only if the data changed and after the time you passed.
```

That code will run for 16 seconds. After the first 4 seconds it will execute your callback. After the second 4 seconds it won't execute
your callback, but this iteration is called a `null iteration`. It will run another 4 seconds without executing your callback 2 times (4*4 = 16).

The code will be executed for 16 seconds because these are the default options of the Debouncer:

```js
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
```

So, atfter 3 `null iterations` it will shutdown, but only if those iterations are contiguous (one followed by another one).

If you want to modify those options, you can pass new options like this:

```js
const Debouncer = require('@addr/debouncer');

const instance = new Debouncer(
    4000,
    myData => console.log("I'm being executed after 4s with", myData),
    {
        nullIterationsToShutdown: 5,
        onlyCountContiguousIterations: false,
        shutdownAfterError: false
    }
);
```

Now, the Debouncer will shutdown after 5 `null iterations`, but they can be separated. Also, it won't shutdown if there's an error.

You can change any of those options (even the `events` option). If you don't specify an option, it will be replaced by a default option.

```js
const Debouncer = require('@addr/debouncer');

// This instance will have the following options:
/*
const baseOptions = {
    nullIterationsToShutdown: 5,
    onlyCountContiguousIterations: false,
    shutdownAfterError: false,
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
*/
const instance = new Debouncer(
    4000,
    myData => console.log('I'm being executed after 4s with', myData),
    {
        nullIterationsToShutdown: 5,
        onlyCountContiguousIterations: false,
        shutdownAfterError: false
    }
);
```

### Available functions

You can manipulate the behavior of your Debouncer by calling these functions:

```js
debounce(data);

shutdownNow();

shutdownAfterCurrentIteration();

reboot(time = 1000, callback = () => {}, options = baseOptions);

changeTime(newTime = 1000);

changeCallback(newCallback = () => {});

changeOptions(newOptions = {});
```

#### debounce

This function will start the timer and receives the data you want to receive in your callback.

#### shutdownNow

This function will shutdown the timer even if there's a pending iteration to be executed.

#### shutdownAfterCurrentIteration

This function will shutdown the timer after the next pending iteration (even `null iterations`);

#### reboot

If your Debouncer got shutted down, you can use this function to restart it. It will shutdown any previous timer and iterations.

```
Note: If you shutdown a Debouncer, you must call this function in order to use it again.
```

#### changeTime

This function will allow you to change the time of your Debouncer. Any pending iterations will still use the previous time.

#### changeCallback

This function will allow you to change the callback of your Debouncer. Any pending iterations will use the new callback.

#### changeOptions

This function will allow you to change the options of your Debouncer. Any pending iterations will use the new options.

```
Note: Please be aware when you call this function and change the events. If you change those, then be sure to reomve all the listeners registered before.
```

## Advanced usage

* The `events` option is an array so you can use whatever names for those events. You only need to maintain the same order for those events. The purpose is to
be flexible for already started and big projects. So, if you have already declared any of those names for another Emitter, then you can use another name.

* The `shutdownAfterCurrentIteration` will also start the timer. So, if you want to only do one iteration, then you can do something like:

```js
const Debouncer = require('@addr/debouncer');

const instance = new Debouncer(
    4000,
    myData => console.log("I'm being executed after 4s with", myData)
);

instance.shutdownAfterCurrentIteration();
```

This will shutdown the timer right after the iteration, but can't pass any data. The data received in your callback will be `undefined`.

* You can also call these 3 functions by emitting events like so:

```
instance.emit('shutdown');                                // Same as instance.shutdownNow();
instance.emit('shutdownAfterCurrentIteration');           // Same as instance.shutdownAfterCurrentIteration();
instance.emit('reboot');                                  // Same as instance.reboot();
```

The purpose is to have the abillity to listen for these events. So, if you have many places in which you do `instance.shutdownNow()` and you want to trace
the one tha is being executed, you can replace the calls for `instance.emit('shutdown')` and listen to that event as follows:

```
instance.on('shutdown', () => {
    console.trace();
})
```

And it will print the precise line that emits the event.

* Your callback can return a promise. To get the response (returned value) of your callback, you can listen to the event called `responseFromCallback` like this:

```js
const Debouncer = require('@addr/debouncer');

const instance = new Debouncer(
    4000,
    myData => new Promise(resolve => resolve("I'm being executed after 4s with " + myData))
);

instance.on('responseFromCallback', console.log); // this will print I'm being executed after 4s with My data

instance.debounce('My data');
```

## Tests

To run the tests you just need to run this command:

```
$> npm test
```

```
Note: Currently I'm still working on the tests. This note will disappear once I have finished all tests.
```

## Examples of use

This library is really useful for auto saving forms. So, if you need an auto save strategy for your app, then you could use this library.