# Log Ride

Simple stream-based logging with an API similar to Node's console. Log Ride exposes a stream property that can be piped into Transform streams for filtering or output formatting. Log Ride is nothing fancy, just merely a no-hassle approach for logging with streams.


## Installation

```bashp
npm install log-ride
```

## Usage


### Use default (singleton) logger piped to JSON.stringify()

```js
const log = require('log-ride').defaultLogger();
const json = new require('stream').Transform({objectMode: true});

json._transform = (chunk, encoding, callback) => {
  json.push(JSON.stringify(chunk) + '\r\n');
  callback();
}

log.stream.pipe(json).pipe(process.stdout);

log.info('Logging %s message to stdout', 'information');
log.error('Logging %s message to stdout', 'error');
log.error('Logging %s to stdout', new Error('Fabulous'));

// Produces:
//   {"info":{"message":"Logging information message to stdout"}}
//   {"error":{"message":"Logging error message to stdout"}}
//   {"error":{"message":"Logging Error: Fabulous to stdout"}}
```

### Define a custom log method

```js
// Shorthand way to obtain the defaultLogger()
const log = require('log-ride')();

log.verbose = (lineNumber, longMessage) => {
  log.custom('verbose', {
    lineNumber: lineNumber,
    longMessage: longMessage
  });
}

log.verbose(123, 'A very verbose message');

// Produces no output since you still need to pipe it!
```


## API


### Module interface

Assuming:

```js
const logRide = require('log-ride');
```

* `logRide.defaultLogger([options])` — Factory method to obtain a default (singleton) Logger. Options to configure the singleton are only recognized on the first call. Note that `logRide([options])` is a shorthand way to obtain the default Logger.

* `logRide.createLogger([options])` — Factory method to create a new Logger instance with options.

* `logRide.Logger` — Exposes the Logger class that can be instantiated via `new Logger([options])`.

Examples:

```js
const logRide = require('log-ride');

const log = logRide.defaultLogger(); // Obtain the default Logger
const log = logRide(); // Obtain the default Logger

const log = logRide.createLogger(); // New Logger instance

// New Logger instance
const Logger = require('log-ride').Logger;
const log = new Logger();

```


### Class: Logger

A Logger object provides the method interface for queuing log entries to an underlying Readable stream that can be piped for output.


### new Logger([options])

Constructor. Creates a new Logger with options. The options object is forwarded to the underlying [HookedReadable](https://github.com/HumansForward/hooked-readable) stream.

**options (Object)**

* `beforePush` (Function) — A callback to invoke every time a log entry is pushed into the stream. Courtesy of HookedReadable.

  Example:

  ```js
  // Add a 'timestamp' property
  beforePush: function(data) { data.timestamp = new Date(); return data; }
  ```

* `highWaterMark` (Number) — The maximum number of log entries to store in the internal stream buffer. Default is 16.


### logger.stream

Returns a Readable stream that can be piped. Streamed log entries are JavaScript objects, and must undergo a transformation for output to the console.

```js
log.stream.pipe(json).pipe(process.stdout);
```


### logger.custom(key, object)

Queues a custom log object `{key: object}` which can be transformed for output downstream. This method is a thin wrapper around the stream's push() method. To implement a custom log method, decorate a Logger instance with a function that calls `logger.custom()`.

Example:

```js
log.verbose = (lineNumber, longMessage) => {
  log.custom('verbose', {
    lineNumber: lineNumber,
    longMessage: longMessage
  });
}

// Now use your method
log.verbose(76, 'A very verbose message');
```


### logger.error([data | error][, ...])

Queues an 'error' log entry. Similar to Node's `console.error()`, multiple arguments can be passed, with the first used as the primary message and all additional used as substitution values (the arguments are all passed to util.format()).

As a convenience, you can also pass an Error object as the first (and only) argument; in which case the error's message becomes the primary message.


### logger.info([data][, ...])

Queues an 'info' log entry. Similar to Node's `console.info()`, multiple arguments can be passed, with the first used as the primary message and all additional used as substitution values (the arguments are all passed to util.format()).


### logger.log([data][, ...])

This is an alias for `logger.info()`.


### logger.warn([data | error][, ...])

This is an alias for `logger.error()`.


## License

[MIT](LICENSE)
