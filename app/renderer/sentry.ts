import { init as SentryInit } from "@sentry/electron/dist/renderer";
import { version } from "../package.json";
import log from "../shared/log";

// this is filled in by github actions
const dsn = "#{SENTRY_DSN}#";

if (dsn.includes("ingest.sentry.io")) {
  SentryInit({
    release: "v" + version,
    dsn: dsn,
  });
  log.info("Sentry active");
}
