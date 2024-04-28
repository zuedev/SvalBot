/**
 * Sends a message to the application owner.
 *
 * @param {import("@discordjs/core").API} api - The Discord API instance to use.
 * @param {String} message - The message to send to the application owner.
 *
 * @returns {Promise<void>}
 */
export default async function messageApplicationOwner(client, message) {
  const application = await client.application.fetch();

  await application.owner.send(message);
}
