const config = require('./config/config');
const log = require("./config/log")("site-guard");
const statusDbClient = require('./config/statusDbClient');
let sites = config('sites');
const request = require('request-promise');

async function main() {
    try{
        for (let site in sites) {
            let siteConfig = sites[site];
            setInterval(async () => {
                let response;
                try {
                    response = await request({
                        url: siteConfig.url,
                        resolveWithFullResponse: true,
                        simple: false
                    });
                    response = response;
                } catch (e) {
                    response = {
                        statusCode: e.message,
                        statusMessage: `Cannot send request to ${siteConfig.url}`
                    };
                }
                log.info(`site = ${site}, send status = ${response.statusCode}`);
                let status = statusDbClient.buildStatusObject(namespace = config("namespace"), key = site, value = response.statusCode, description = response.statusMessage);
                await statusDbClient.sendStatus(status);

            }, sites[site].period);
            log.info(`Watcher started for ${site}`);
        }
        log.info(`All watchers started`);
    }catch (e) {
        log.error("App failed", e);
    }
}

main();