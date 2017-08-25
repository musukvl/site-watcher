const request = require('request-promise');
const hash = require('object-hash');
const moment = require('moment');
const log = require("../config/log")("StatusDbClient");


class StatusDbClient {

    constructor(serverUrl, apiKey) {
        this._serverUrl = serverUrl;
        this._apiKey = apiKey;
    }

    async sendStatus(statusList) {
        if (!(statusList instanceof Array)) {
            statusList = [statusList];
        }

        let sendStatusResponse = await request({
            method: 'POST',
            uri: `${this._serverUrl}/api/status`,
            body: {status: statusList},
            qs: {},
            headers: {
                'X-Api-Key': this._apiKey
            },
            json: true
        });

        return sendStatusResponse;
    }

    buildStatusObject(namespace, key, value, description = "", valueHash = "") {
        let status = {
            namespace: namespace,
            key: key,
            value: value,
            valueHash: valueHash,
            description: description
        };
        return this.checkStatusObject(status);
    }

    checkStatusObject(status) {
        if (!status.valueHash) {
            status.valueHash = hash(status.value);
        }
        if (!status.date) {
            status.date = moment.utc()
        }
        return status;
    }
}

module.exports = StatusDbClient;