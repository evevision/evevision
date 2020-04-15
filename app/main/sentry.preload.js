const sentry = require('@sentry/electron/dist/renderer');
const package = require('../../package.json');

// this is filled in by github actions
const dsn = "#{SENTRY_DSN}#"

if(dsn.includes("ingest.sentry.io")) {
    sentry.init({
        release: 'v' + package.version,
        dsn: dsn
    });
}