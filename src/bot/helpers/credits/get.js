import { find } from "../../../controllers/mongodb.js";

/**
 * Gets a user's credits.
 *
 * @param {string} user - The user to get credits for.
 *
 * @returns {Promise<number>} The user's credits.
 */
export default async function get(userId) {
  const credits = (await find("users", { userId }))[0]?.credits;

  return credits || 0;
}
