import { SlashCommandBuilder } from "@discordjs/builders";
import { dalle } from "#controllers/openai.js";
import getCredits from "#bot/helpers/credits/get.js";
import addCredits from "#bot/helpers/credits/add.js";
import getApplicationOwner from "#bot/helpers/getApplicationOwner.js";

export default {
  data: new SlashCommandBuilder()
    .setName("svalle")
    .setDescription("Responds with an AI-powered image.")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("The prompt for the AI to generate an image for.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("aspect_ratio")
        .setDescription("The aspect ratio of the image.")
        .addChoices(
          {
            name: "square (1:1)",
            value: "1024x1024",
          },
          {
            name: "landscape (~16:9)",
            value: "1792x1024",
          },
          {
            name: "portrait (~9:16)",
            value: "1024x1792",
          }
        )
    )
    .addStringOption((option) =>
      option
        .setName("style")
        .setDescription("The style of the image.")
        .addChoices(
          {
            name: "vivid",
            value: "vivid",
          },
          {
            name: "natural",
            value: "natural",
          }
        )
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

    const prompt = interaction.options.getString("prompt");
    const aspect_ratio = interaction.options.getString("aspect_ratio");
    const style = interaction.options.getString("style");

    await interaction.deferReply();

    const options = {
      prompt,
      user: `discord-${interaction.user.tag}-${interaction.user.id}`,
    };

    if (aspect_ratio) options.size = aspect_ratio;
    if (style) options.style = style;

    const response = await dalle(options);

    // if the response is an error, send the error message
    if (response.status !== 200)
      return await interaction.followUp(response.message);

    // download the image
    const image = await fetch(response.url, {
      encoding: null, // to get the buffer
    });

    await interaction.followUp({
      files: [
        {
          attachment: image.body,
          name: `svalle-${prompt}.png`,
        },
      ],
    });

    await addCredits(interaction.user.id, -1);
  },
};
