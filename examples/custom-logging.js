'use strict';

const stream = require('stream');
const util = require('util');

/**
 * Transform stream that formats data as text logs.
 */
class LogFormatter extends stream.Transform {
  constructor() {
    super({objectMode: true});
  }

  _transform(chunk, encoding, callback) {
    let str = '';

    if (chunk.timestamp) {
      str += '[' + chunk.timestamp + '] ';
    }

    if (chunk.error && chunk.error.message) {
      str += 'ERRO ' + chunk.error.message;
    } else if (chunk.info && chunk.info.message) {
      str += 'INFO ' + chunk.info.message;
    } else if (chunk.verbose) {
      str += 'VERB ' + chunk.verbose.longMessage + ' at line ' + chunk.verbose.lineNumber;
    } else {
      str += 'MISC ' + util.format(chunk);
    }

    this.push(str + '\r\n');
    callback();
  }
}

/**
 * Create default (singleton) logger with options.
 *
 * Subsequent calls to defaultLogger() will always return the
 *  same logger instance in an application.
 *
 * LogRide uses HookedReadable internally; so we can specify a
 *  beforePush hook to timestamp log entries (optional).
 */
const log = require('../lib/log-ride').defaultLogger({
  beforePush: (data) => {
    data.timestamp = new Date();
    return data;
  }
});

/**
 * Pipe formatter into stdout, and log stream into formatter.
 */
const formatter = new LogFormatter();
formatter.pipe(process.stdout)

log.stream.pipe(formatter);

log.info('Logging %s message to stdout', 'information');
log.error('Logging %s message to stdout', 'error');
log.error('Logging %s to stdout', new Error('Fabulous'));

/**
 * Decorate LogRide with a custom logging method.
 *
 * The formatter stream above makes it pretty for output.
 */
log.verbose = (lineNumber, longMessage) => {
  log.custom('verbose', {
    lineNumber: lineNumber,
    longMessage: longMessage
  });
}

log.verbose(76, 'A very verbose message');

/**
 * Now merge another stream into the formatter just for fun.
 */
const myStream = new stream.Readable({
  objectMode: true,
  read: () => {}
});

myStream.pipe(formatter);
myStream.push({
  hello: 'world',
  timestamp: new Date()
});
