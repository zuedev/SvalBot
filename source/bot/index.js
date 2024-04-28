import {
  Client,
  GatewayIntentBits,
  Events,
  Partials,
  ActivityType,
} from "discord.js";

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

  await client.login(process.env.DISCORD_BOT_TOKEN);
};
