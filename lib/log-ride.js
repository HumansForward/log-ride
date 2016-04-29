/**
 * Simple stream-based logging with a console-like interface.
 *
 * @author J. Scott Smith
 * @copyright 2016 Humans Forward (J. Scott Smith, Paul Dhillon Weber). All rights reserved.
 * @license  MIT
 * @module lib/log-ride
 */

'use strict';

const HookedReadable = require('hooked-readable');
const util = require('util');

class Logger {
  constructor(options) {
    this._stream = new HookedReadable(options);
    this.log = this.info;
    this.warn = this.error;
  }

  get stream() {
    return this._stream;
  }

  custom(key, obj) {
    this._stream.push({[key]: obj});
  }

  error(data) {
    if ((data instanceof Error) && data.message) {
      this._stream.push({
        error: {
          message: data.message
        }
      });
    } else {
      this._stream.push({
        error: {
          message: util.format.apply(this, arguments)
        }
      });
    }
  }

  info() {
    this._stream.push({
      info: {
        message: util.format.apply(this, arguments)
      }
    });
  }
}

/**
 * Export interface
 */

exports = module.exports = (options) => {
  return exports.defaultLogger(options);
}

exports.createLogger = (options) => {
  return new Logger(options);
}

let defaultLogger;
exports.defaultLogger = (options) => {
  if (!defaultLogger) defaultLogger = new Logger(options);
  return defaultLogger;
};

exports.Logger = Logger;
