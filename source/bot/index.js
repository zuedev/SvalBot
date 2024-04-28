import {
  Client,
  GatewayIntentBits,
  Events,
  Partials,
  ActivityType,
} from "discord.js";

import fs from "fs";
import log from "../library/log.js";

export default async () => {
  log("Bot is starting...");

  const client = new Client({
    intents: Object.values(GatewayIntentBits),
    partials: Object.values(Partials),
  });

  client.on(Events.ClientReady, async () => {
    client.user.setActivity({
      type: ActivityType.Watching,
      name: "my boot logs",
    });

    log(`Bot has started! Logged in as ${client.user.tag}`);

    client.user.setActivity({
      type: ActivityType.Listening,
      name: "to the voices",
    });
  });

  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    const prefix = "!";

    if (message.content.startsWith(prefix)) {
      try {
        const [command, ...args] = message.content
          .slice(prefix.length)
          .split(" ");

        (await import(`./MessageCreate.Commands/${command}.js`)).default({
          message,
          args,
        });
      } catch (error) {
        log(error);
        message.channel.send("That command does not exist.");
      }
    }
  });

  await client.login(process.env.DISCORD_BOT_TOKEN);
};
