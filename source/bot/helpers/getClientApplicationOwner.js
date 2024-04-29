/**
 * Gets a client's application owner.
 *
 * @param {import("discord.js").Client} client - The client.
 *
 * @returns {Promise<import("discord.js").User>} The application owner.
 */
export default async (client) => {
  const application = await client.application.fetch();

  return application.owner;
};
