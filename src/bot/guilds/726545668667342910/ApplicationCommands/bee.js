import { SlashCommandBuilder } from "@discordjs/builders";

export default {
  data: new SlashCommandBuilder()
    .setName("bee")
    .setDescription("I'm a bee. I'm a bee. I'm a bee."),
  async execute({ interaction }) {
    await interaction.reply(
      "https://tenor.com/view/bee-waggle-dance-bumble-bumblebee-gif-21989682"
    );
  },
};
