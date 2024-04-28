import {
  Client,
  GatewayIntentBits,
  Events,
  Partials,
  ActivityType,
} from "discord.js";
import { readdirSync, existsSync } from "fs";
import registerCronJobs from "./helpers/registerCronJobs.js";
import randomActivity from "./helpers/randomActivity.js";
import log from "../lib/log.js";
import { unemojify } from "node-emoji";
import getApplicationOwner from "./helpers/getApplicationOwner.js";
import messageApplicationOwner from "./helpers/messageApplicationOwner.js";
import { execSync } from "child_process";
import { random as randomGif } from "../controllers/giphy.js";
import getCredits from "./helpers/credits/get.js";
import addCredits from "./helpers/credits/add.js";

log("Starting bot...");

export default {
  start,
};

const state = {};

/**
 * Starts the bot.
 *
 * @param {string} [token] - The Discord bot token to use.
 *
 * @returns {Promise<void>}
 */
async function start(token = process.env.DISCORD_BOT_TOKEN) {
  const client = new Client({
    intents: Object.values(GatewayIntentBits),
    partials: Object.values(Partials),
  });

  client.on(Events.ClientReady, async () => {
    log(`Bot ready, logged in as ${client.user.tag}!`);

    // update status to booting
    client.user.setActivity("my boot logs...", {
      type: ActivityType.Watching,
    });

    // setup cron
    await registerCronJobs([
      // {
      //   cronTime: "* * * * * *",
      //   onTick: () => {
      //     console.log("You will see this message every second");
      //   },
      // },
      {
        cronTime: "0 * * * * *",
        onTick: randomActivity(client),
        runOnInit: true,
      },
    ]);

    // tell owner bot is ready with some debug info
    const bootDebug = {
      gitCommitHash: execSync("git rev-parse HEAD").toString().trim(),
      gitCommitMessage: execSync("git log -1 --pretty=%B").toString().trim(),
    };
    await messageApplicationOwner(
      client,
      "# Boot Debug\n" +
        "```json\n" +
        JSON.stringify(bootDebug, null, 2) +
        "\n```"
    );
  });

  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    if (message.content.toLowerCase().startsWith(";")) {
      const applicationOwner = await getApplicationOwner(client);

      if (message.author.id !== applicationOwner.id)
        return message.reply("Only the bot owner can use `;` commands.");

      const command = message.content.slice(1).split(" ")[0];
      const args = message.content.slice(1).split(" ").slice(1);

      switch (command) {
        case "credits":
          switch (args[0]) {
            case "get":
              (async () => {
                const userId = args[1] || message.author.id;

                message.reply(
                  `<@${userId}> has \`${await getCredits(userId)}\` credits.`
                );
              })();
              break;
            case "add":
              (async () => {
                const userId = args[1];
                const amount = parseInt(args[2]);

                if (!userId || !amount)
                  return message.reply(
                    "You must provide a user and an amount to add."
                  );

                message.reply(
                  `<@${userId}> now has \`${await addCredits(
                    userId,
                    amount
                  )}\` credits.`
                );
              })();
              break;
            default:
              break;
          }
          break;
        case "ping":
          message.reply("Pong!");
          break;
        default:
          break;
      }
    }

    if (unemojify(message.content).toLowerCase().includes("banana"))
      message.reply("🍌");

    if (
      unemojify(message.content).toLowerCase().includes("jigglepuppycat") &&
      message.author.id === "324031309447954433" // birthday
    )
      message.reply(
        "https://media4.giphy.com/media/SURG6HUZaWY7jEGvnK/giphy.gif"
      );

    if (
      unemojify(message.content).toLowerCase().includes("boo_eyes") &&
      message.author.id === "196055238485082113" // tinycrusader
    )
      message.reply(
        await randomGif({
          query: "yugioh",
        })
      );
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;

    // are we in a guild?
    let guildId = interaction?.guild?.id || "0";

    // get command
    let command;

    // if we're in development mode and the command is prefixed with dev-*
    if (
      process.env.ENVIRONMENT === "development" &&
      /^dev-\d+-/.test(interaction.commandName)
    ) {
      // change the guild id to the original guild id from the command name
      guildId = interaction.commandName.match(/^dev-(\d+)-/)[1];

      // strip the dev prefix from the command name
      interaction.commandName = interaction.commandName.replace(
        /^dev-\d+-/,
        ""
      );
    }

    try {
      // try to get guild-specific command first
      command = (
        await import(
          `./guilds/${guildId}/ApplicationCommands/${interaction.commandName}.js`
        )
      ).default;
    } catch (error) {
      // if it doesn't exist, get the global command
      command = (
        await import(
          `./guilds/0/ApplicationCommands/${interaction.commandName}.js`
        )
      ).default;
    }

    // execute command
    await command.execute({
      interaction,
      client,
    });
  });

  log("Discord client logging in...");

  // Login
  await client.login(token);

  log("Discord client logged in!");
  log("Registering commands...");

  // Register commands
  await registerCommands(client);

  log("Commands registered!");
}

/**
 * Registers commands from the guilds/ directory.
 *
 * @param {Client} client - The client to register commands for.
 *
 * @returns {Promise<void>}
 */
async function registerCommands(client) {
  const globalCommands = [];
  const guildCommands = [];

  // Loop through each guild directory
  for (let guildDir of readdirSync("./src/bot/guilds")) {
    // Ignore non-directories
    if (!existsSync(`./src/bot/guilds/${guildDir}/`)) continue;

    // get all .js files in the ApplicationCommands subdirectory
    const commandFiles = readdirSync(
      `./src/bot/guilds/${guildDir}/ApplicationCommands`
    ).filter((file) => file.endsWith(".js"));

    // Loop through each command file, and register it
    for (const file of commandFiles) {
      const command = (
        await import(`./guilds/${guildDir}/ApplicationCommands/${file}`)
      ).default;

      // if the guild is 0, it's a global command
      if (guildDir === "0") {
        globalCommands.push(command.data);
      } else {
        // if we're in development mode & not in the dev guild
        if (
          process.env.ENVIRONMENT === "development" &&
          guildDir !== "1143811225457795102"
        ) {
          // rename the command to include the original guild id
          command.data.name = `dev-${guildDir}-${command.data.name}`;

          // and reassign the guild dir to the dev guild
          guildDir = "1143811225457795102";
        }

        guildCommands[guildDir] = [
          ...(guildCommands[guildDir] || []),
          command.data,
        ];
      }
    }
  }

  // do any of the guilds have duplicate commands with the global commands?
  for (const [guildId, commands] of Object.entries(guildCommands)) {
    guildCommands[guildId] = commands.filter(
      (command) =>
        !globalCommands.find(
          (globalCommand) => globalCommand.name === command.name
        )
    );
  }

  // get application id
  const application = await client.rest.get("/applications/@me");

  // Register global commands
  await client.rest.put(`/applications/${application.id}/commands`, {
    body: globalCommands,
  });

  // Register guild commands
  for (const [guildId, commands] of Object.entries(guildCommands)) {
    try {
      await client.rest.put(
        `/applications/${application.id}/guilds/${guildId}/commands`,
        {
          body: commands,
        }
      );
    } catch (error) {
      // if development, ignore missing permissions
      if (process.env.ENVIRONMENT === "development" && error.code === 50001)
        continue;

      // otherwise, check if missing permissions is the dev guild id
      if (error.code === 50001 && guildId === "1143811225457795102") continue;

      throw error;
    }
  }
}
