import "dotenv/config";
import bot from "./bot/index.js";
import api from "./api/index.js";

import log from "./library/log.js";

log("Main boot sequence has started...");

await api();
await bot();

log("Main boot sequence has completed!");
