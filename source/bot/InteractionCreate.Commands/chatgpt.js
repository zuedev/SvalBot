import { SlashCommandBuilder } from "@discordjs/builders";
import { chatgpt } from "#controllers/openai.js";
import getClientApplicationOwner from "#bot/helpers/getClientApplicationOwner.js";

export default {
  data: new SlashCommandBuilder()
    .setName("chatgpt")
    .setDescription("Replies with a response from ChatGPT.")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("The prompt to get a response for.")
        .setRequired(true)
    ),
  async execute({ interaction }) {
    const owner = await getClientApplicationOwner(interaction.client);
    if (interaction.user.id !== owner.id)
      return interaction.reply("You are not authorized to use this command.");

    try {
      const prompt = interaction.options.getString("prompt");

      await interaction.deferReply();
      await interaction.channel.sendTyping();

      const response = await chatgpt({
        prompt,
        user: `discord:${interaction.user.id}`,
      });

      if (response.status !== 200) throw new Error(response.message);

      // is the reponse more than 2000 characters?
      if (response.response.length > 2000)
        return interaction.followUp({
          content:
            "Sending the response as a file as it's too long to send as a message.",
          files: [
            {
              attachment: Buffer.from(response.response),
              name: "response.txt",
            },
          ],
        });

      return interaction.followUp(response.response);
    } catch (error) {
      console.error(error);

      return interaction.followUp("Failed to get a response from ChatGPT.");
    }
  },
};
