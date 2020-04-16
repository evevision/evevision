import { init as SentryInit } from "@sentry/electron/dist/main";
import { version } from "../../package.json";

// this is filled in by github actions
const dsn = "#{SENTRY_DSN}#";

if (dsn.includes("ingest.sentry.io")) {
  SentryInit({
    release: "v" + version,
    dsn: dsn
  });
}
