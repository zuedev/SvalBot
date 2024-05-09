import { readdirSync } from "fs";
import log from "#library/log.js";
import { Routes } from "discord.js";

export default async (client) => {
  const commands = [];

  const commandFiles = readdirSync(
    "./source/bot/InteractionCreate.Commands"
  ).filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const { data } = (await import(`./InteractionCreate.Commands/${file}`))
      .default;

    commands.push(data);
  }

  if (process.env.DEVELOPMENT_GUILD_ID) {
    log(
      "Development guild ID set, registering slash commands there and clearing global commands."
    );

    await client.rest.put(
      Routes.applicationGuildCommands(
        client.application.id,
        process.env.DEVELOPMENT_GUILD_ID
      ),
      {
        body: commands,
      }
    );

    log(
      `Slash commands registered in development guild: ${commands.map(
        (c) => c.name
      )}`
    );
  } else {
    await client.rest.put(Routes.applicationCommands(client.application.id), {
      body: commands,
    });

    log(`Global slash commands registered: ${commands.map((c) => c.name)}`);
  }
};
