'use strict';

const Transform = require('stream').Transform;

/**
 * Transform stream that formats data as JSON strings.
 */
class JsonFormatter extends Transform {
  constructor() {
    super({objectMode: true});
  }

  _transform(chunk, encoding, callback) {
    try {
      this.push(JSON.stringify(chunk) + '\r\n');
    } catch (e) {
      // No-op
    }

    callback();
  }
}

/**
 * Transform stream to supress 'info' log entries.
 */
class NonVerboseFilter extends Transform {
  constructor() {
    super({objectMode: true});
  }

  _transform(chunk, encoding, callback) {
    if (chunk.info) {
      // No-op
    } else {
      this.push(chunk);
    }

    callback();
  }
}

/**
 * Create custom logger instance.
 *
 * Subsequent calls to createLogger() will always return a new
 *  logger instance.
 */
const verboseLog = require('../lib/log-ride').createLogger();

/**
 * Pipe formatter into stdout, and log stream into formatter.
 */
const formatter = new JsonFormatter();
formatter.pipe(process.stdout)

verboseLog.stream.pipe(formatter);

verboseLog.info('Logging %s message to stdout', 'information');
verboseLog.error('Logging %s message to stdout', 'error');
verboseLog.error('Logging %s to stdout', new Error('Fabulous'));

/**
 * Now create another logger and pipe through a non-verbose filter.
 *
 * Note that info 'another information' will be supressed.
 */
const nonVerboseLog = require('../lib/log-ride').createLogger();

nonVerboseLog.stream.pipe(new NonVerboseFilter).pipe(formatter);

nonVerboseLog.info('Logging %s message to stdout', 'another information'); // Filtered!
nonVerboseLog.error('Logging %s message to stdout', 'another error');
nonVerboseLog.error('Logging %s to stdout', new Error('Awesome'));
