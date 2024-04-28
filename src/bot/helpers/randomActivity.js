import { ActivityType } from "discord.js";

/**
 * Sets a random activity for the bot.
 *
 * @param {import("discord.js").Client} client The client.
 *
 * @returns {Promise<void>}
 */
export default async function randomActivity(client) {
  const availableActivities = [
    {
      name: "Listening",
      value: "enemy comms",
    },
    {
      name: "Watching",
      value: "you all suffer",
    },
    {
      name: "Playing",
      value: "with your minds",
    },
  ];

  const randomActivity =
    availableActivities[Math.floor(Math.random() * availableActivities.length)];

  client.user.setActivity(randomActivity.value, {
    type: ActivityType[randomActivity.name],
  });
}
