import { dalle } from "#controllers/openai.js";
import getClientApplicationOwner from "#bot/helpers/getClientApplicationOwner.js";

/**
 * Generates some AI art using a prompt.
 * @param {Object} param0.message - The message object.
 * @returns {Promise<void>} A Promise.
 */
export default async ({ message, args }) => {
  const owner = await getClientApplicationOwner(message.client);
  if (message.author.id !== owner.id)
    return message.reply("You are not authorized to use this command.");

  const prompt = args.join(" ");

  if (!prompt) return message.reply("Please provide a prompt.");

  const reply = await message.reply("Generating the image...");

  const response = await dalle({
    prompt,
    user: message.author.id,
  });

  if (response.status !== 200)
    return reply.edit("There was an error generating the image.");

  const image = await fetch(response.url, {
    encoding: null, // to get the raw buffer
  });

  await reply.edit({
    content: `**Prompt:** \`${prompt}\``,
    files: [
      {
        attachment: image.body,
        name: `svalle-${prompt}.png`,
      },
    ],
  });
};
