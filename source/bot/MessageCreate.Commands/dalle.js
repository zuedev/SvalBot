import { dalle } from "#controllers/openai.js";
import getClientApplicationOwner from "#bot/helpers/getClientApplicationOwner.js";

export default async ({ message, args }) => {
  const owner = await getClientApplicationOwner(message.client);
  if (message.author.id !== owner.id)
    return message.reply("You are not authorized to use this command.");

  const reply = await message.reply("Generating image...");

  try {
    const prompt = args.join(" ");

    const response = await dalle({
      prompt,
      user: `discord:${message.author.id}`,
    });

    if (response.status !== 200) throw new Error(response.message);

    const image = await fetch(response.url, {
      encoding: null,
    });

    return reply.edit({
      content: `**Prompt:** \`${prompt}\``,
      files: [
        {
          attachment: image.body,
          name: `svalle-${prompt}.png`,
        },
      ],
    });
  } catch (error) {
    console.error(error);

    return reply.edit("Failed to generate image.");
  }
};
