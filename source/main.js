import "dotenv/config";
import bot from "./bot/index.js";
import api from "./api/index.js";

import log from "./library/log.js";

log("Main boot sequence has started...");

// missing required env vars check
const requiredEnvVars = ["DISCORD_BOT_TOKEN", "MONGODB_URI", "OPENAI_API_KEY"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length)
  throw new Error(
    `Missing environment variables: ${missingEnvVars.join(", ")}`
  );

// set optional env vars defaults
process.env.ENVIRONMENT ??= `unnamed-${Math.random().toString(36).slice(2)}`;

await api();
await bot();

log("Main boot sequence has completed!");
