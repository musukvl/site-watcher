const StatusDbClient = require('../core/StatusDbClient');
const config = require('./config');

module.exports = new StatusDbClient(config('status-db-url'), config('api-key'));
