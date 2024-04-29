import { readdirSync } from "fs";
import log from "#library/log.js";

/**
 * Register all slash commands.
 */
export default async (client) => {
  await globalCommands(client);
};

async function globalCommands(client) {
  const globalCommands = [];

  const commandFiles = readdirSync(
    "./source/bot/InteractionCreate.Commands"
  ).filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const { data } = (await import(`./InteractionCreate.Commands/${file}`))
      .default;

    globalCommands.push(data);
  }

  await client.rest.put(`/applications/${client.application.id}/commands`, {
    body: globalCommands,
  });

  log(`Global slash commands registered: ${globalCommands.map((c) => c.name)}`);
}
