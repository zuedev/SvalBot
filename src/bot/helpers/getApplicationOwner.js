/**
 * Gets the application owner.
 *
 * @param {import("@discordjs/core").API} api - The Discord API instance to use.
 *
 * @returns {Promise<void>}
 */
export default async function getApplicationOwner(client) {
  const application = await client.application.fetch();

  return application.owner;
}
