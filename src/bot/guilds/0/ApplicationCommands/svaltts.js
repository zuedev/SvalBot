import { SlashCommandBuilder } from "@discordjs/builders";
import { tts } from "#controllers/openai.js";
import getCredits from "#bot/helpers/credits/get.js";
import addCredits from "#bot/helpers/credits/add.js";
import getApplicationOwner from "#bot/helpers/getApplicationOwner.js";

export default {
  data: new SlashCommandBuilder()
    .setName("svaltts")
    .setDescription("Responds with a AI-powered text-to-speech.")
    .addStringOption((option) =>
      option
        .setName("input")
        .setDescription("The text for the AI to generate an audio for.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("voice")
        .setDescription("The voice to use for the audio.")
        .addChoices(
          {
            name: "alloy",
            value: "alloy",
          },
          {
            name: "echo",
            value: "echo",
          },
          {
            name: "fable",
            value: "fable",
          },
          {
            name: "onyx",
            value: "onyx",
          },
          {
            name: "nova",
            value: "nova",
          },
          {
            name: "shimmer",
            value: "shimmer",
          }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName("speed")
        .setDescription("The speed of the audio.")
        .addChoices(
          {
            name: "slow",
            value: 0.5,
          },
          {
            name: "normal",
            value: 1,
          },
          {
            name: "fast",
            value: 2,
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

    const input = interaction.options.getString("input");
    const voice = interaction.options.getString("voice");
    const speed = interaction.options.getInteger("speed");

    await interaction.deferReply();

    const options = {
      input,
    };

    if (voice) options.voice = voice;
    if (speed) options.speed = speed;

    const response = await tts(options);

    if (response.error)
      return await interaction.followUp(response.error.message);

    await interaction.followUp({
      files: [
        {
          attachment: response,
          name: "response.wav",
        },
      ],
    });

    await addCredits(interaction.user.id, -1);
  },
};
