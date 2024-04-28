import { SlashCommandBuilder } from "@discordjs/builders";
import { chatgpt } from "#controllers/openai.js";
import getCredits from "#bot/helpers/credits/get.js";
import addCredits from "#bot/helpers/credits/add.js";
import getApplicationOwner from "#bot/helpers/getApplicationOwner.js";

export default {
  data: new SlashCommandBuilder()
    .setName("svalgpt")
    .setDescription("Responds with an AI-powered message.")
    .addStringOption((option) =>
      option
        .setName("prompt_text")
        .setDescription("The text to prompt the AI with.")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("prompt_image")
        .setDescription("The image to prompt the AI with.")
        .setRequired(false)
    ),
  async execute({ interaction }) {
    // Only allow the application owner to use this command in DMs
    if (interaction.channel.type === "DM") {
      const applicationOwner = await getApplicationOwner();
      if (interaction.user.id !== applicationOwner.id)
        return await interaction.reply({
          content:
            "This command can only be used by the application owner in DMs.",
        });
    }

    const credits = await getCredits(interaction.user.id);

    if (credits < 1)
      return await interaction.reply({
        content: "You don't have enough credits to use this command.",
      });

    const prompt_text = interaction.options.getString("prompt_text");
    const prompt_image = interaction.options.getAttachment("prompt_image");

    await interaction.deferReply();

    const response = await chatgpt({
      promptText: prompt_text,
      promptImageUrl: prompt_image?.url,
      user: `discord-${interaction.user.tag}-${interaction.user.id}`,
    });

    if (response.error) {
      await interaction.followUp(response.error);
    } else {
      await interaction.followUp(response);
      await addCredits(interaction.user.id, -1);
    }
  },
};
