'use strict';

const log = require('../lib/log-ride').defaultLogger();
const json = new require('stream').Transform({objectMode: true});

json._transform = (chunk, encoding, callback) => {
  json.push(JSON.stringify(chunk) + '\r\n');
  callback();
}

log.stream.pipe(json).pipe(process.stdout);

log.info('Logging %s message to stdout', 'information');
log.error('Logging %s message to stdout', 'error');
log.error('Logging %s to stdout', new Error('Fabulous'));
