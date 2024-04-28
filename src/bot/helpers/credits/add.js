import { upsert } from "../../../controllers/mongodb.js";
import get from "./get.js";

/**
 * Adds credits to a user.
 *
 * @param {string} user - The user to get credits for.
 * @param {number} amount - The amount of credits to add.
 *
 * @returns {Promise<number>} The user's credits after adding.
 */
export default async function add(userId, amount) {
  await upsert("users", { userId }, { $inc: { credits: amount } });

  const credits = await get(userId);

  return credits;
}
