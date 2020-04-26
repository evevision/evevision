// this is filled in by github actions
export const dsn = "#{SENTRY_DSN}#";
export const isSentryEnabled = dsn.includes("ingest.sentry.io");
