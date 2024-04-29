import { SlashCommandBuilder } from "@discordjs/builders";

/**
 * Responds with "Pong!".
 */
export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong!"),
  async execute(interaction) {
    await interaction.reply("Pong!");
  },
};
