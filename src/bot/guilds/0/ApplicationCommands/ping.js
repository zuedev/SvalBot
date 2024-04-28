import { SlashCommandBuilder } from "@discordjs/builders";
import snowflakeToTimestamp from "../../../helpers/snowflakeToTimestamp.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong and the time it took to respond."),
  async execute({ interaction }) {
    const timestamp = await snowflakeToTimestamp(interaction.id);
    const diff = Math.abs(Date.now() - timestamp);

    await interaction.reply(`Pong! \`${diff}ms\``);
  },
};
