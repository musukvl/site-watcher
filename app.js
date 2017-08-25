const config = require('./config/config');
const log = require("./config/log")("site-guard.main");
const statusDbClient = require('./config/statusDbClient');
let sites = config('sites');
const request = require('request-promise');
const pmx = require('pmx');
const Probe = require('pmx').probe();

let appStatistics = {
    statusDbErrors : 0,
    statusDbLastError: "",
    counters: {}
};

pmx.action('service-stat', (reply) => {
    reply(appStatistics);
});

async function main() {
    log.info(`App started with env=${config('NODE_ENV')} statusDB=${config('status-db-url')}`);
    try{
        for (let site in sites) {
            let siteConfig = sites[site];

            appStatistics.counters[site] = 0;
            let metric = Probe.metric({
                name    : `${site}-counter`,
                value   : () => {
                    return appStatistics.counters[site];
                }
            });

            setInterval(async () => {
                let response;
                appStatistics.counters[site]++;
                try {
                    response = await request({
                        url: siteConfig.url,
                        resolveWithFullResponse: true,
                        simple: false
                    });
                    response = response;
                } catch (e) {
                    appStatistics.errors++;
                    response = {
                        statusCode: e.message,
                        statusMessage: `Cannot send request to ${siteConfig.url}`
                    };
                }
                log.debug(`site = ${site}, send status = ${response.statusCode}`);
                let status = statusDbClient.buildStatusObject(namespace = config("namespace"), key = site, value = response.statusCode, description = response.statusMessage);
                try {
                    await statusDbClient.sendStatus(status);
                } catch(e) {
                    appStatistics.statusDbErrors++;
                    appStatistics.statusDbLastError = e.message;
                }
            }, sites[site].period);
            log.info(`Watcher started for ${site}`);
        }
        log.info(`All watchers started`);
    }catch (e) {
        log.error("App failed", e);
    }
}

main();