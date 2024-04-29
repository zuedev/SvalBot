import { chatgpt } from "#controllers/openai.js";
import getClientApplicationOwner from "#bot/helpers/getClientApplicationOwner.js";

/**
 * Replies with a response from ChatGPT.
 */
export default async ({ message, args }) => {
  // const owner = await getClientApplicationOwner(message.client);
  // if (message.author.id !== owner.id)
  //   return message.reply("You are not authorized to use this command.");

  try {
    await message.channel.sendTyping();

    const response = await chatgpt({
      prompt: args.join(" "),
      user: `discord:${message.author.id}`,
    });

    if (response.status !== 200) throw new Error(response.message);

    // is the reponse more than 2000 characters?
    if (response.response.length > 2000)
      return message.reply({
        content:
          "Sending the response as a file as it's too long to send as a message.",
        files: [
          {
            attachment: Buffer.from(response.response),
            name: "response.txt",
          },
        ],
      });

    return message.reply(response.response);
  } catch (error) {
    console.error(error);

    return message.reply("Failed to get a response from ChatGPT.");
  }
};
