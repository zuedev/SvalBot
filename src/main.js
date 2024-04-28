import "dotenv/config";
import bot from "./bot/index.js";
import log from "./lib/log.js";

import * as Sentry from "@sentry/node";

log("Initializing Sentry...");

Sentry.init({
  dsn: process.env.GITLAB_SENTRY_DSN,
  environment: process.env.ENVIRONMENT,
});

log("Starting main process...");

await bot.start();

log("Main process started!");
