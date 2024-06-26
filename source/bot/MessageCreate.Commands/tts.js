import { tts } from "#controllers/openai.js";
import getClientApplicationOwner from "#bot/helpers/getClientApplicationOwner.js";

export default async ({ message, args }) => {
  const owner = await getClientApplicationOwner(message.client);
  if (message.author.id !== owner.id)
    return message.reply("You are not authorized to use this command.");

  const reply = await message.reply("Generating TTS...");

  try {
    const input = args.join(" ");

    const response = await tts({
      input,
      user: `discord:${message.author.id}`,
    });

    if (response.status !== 200) throw new Error(response.message);

    return reply.edit({
      content: `**Prompt:** \`${input}\``,
      files: [
        {
          attachment: response.buffer,
          name: `svalle-${input}.wav`,
        },
      ],
    });
  } catch (error) {
    console.error(error);

    return reply.edit("Failed to generate TTS.");
  }
};
