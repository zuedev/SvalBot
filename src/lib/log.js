import { insert } from "../controllers/mongodb.js";
/**
 * Logs something to the console and records it in the database.
 *
 * @param {any} message - The message to log.
 *
 * @returns {Promise<void>}
 */
export default async function log(message) {
  const log = {
    timestamp: new Date().toISOString(),
    message,
  };

  console.log(log);

  await insert("logs", log);
}
