import {
  Client,
  GatewayIntentBits,
  Events,
  Partials,
  ActivityType,
} from "discord.js";

import log from "../library/log.js";
import getGitCommit from "../library/getGitCommit.js";

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

    const version = `commit#${getGitCommit().hash.short}`;

    log(`Bot has started! Logged in as ${client.user.tag} running ${version}`);

    client.user.setActivity({
      type: ActivityType.Playing,
      name: version,
    });
  });

  client.on(Events.MessageCreate, async (message) => {
    if (process.env.DEVELOPMENT_GUILD_ID)
      if (message.guild.id !== process.env.DEVELOPMENT_GUILD_ID) return;

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
