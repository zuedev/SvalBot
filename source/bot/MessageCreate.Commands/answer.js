import { chatgpt } from "#controllers/openai.js";
import log from "#library/log.js";
import getClientApplicationOwner from "#bot/helpers/getClientApplicationOwner.js";

/**
 * Replies with the answer to the question.
 * @param {Object} param0.message - The message object.
 * @param {string[]} param0.args - The arguments.
 * @returns {Promise<void>} A promise that resolves when the command is handled.
 */
export default async ({ message, args }) => {
  const owner = await getClientApplicationOwner(message.client);

  if (message.author.id !== owner.id)
    return message.reply("You are not authorized to use this command.");

  let question = args.join(" ");

  let response;

  try {
    if (!question) response = "You must provide a question.";

    let personality = [
      "Answer the question to the best of your ability.",
      "Try to be as brief as possible.",
      `The user asking is ${message.author.tag || "anonymous"}.`,
    ].join(" ");

    response = await chatgpt({
      personality,
      promptText: question,
      user: message.author.id,
    });
  } catch (error) {
    log(error);
    response = "I'm sorry, but I can't respond to that.";
  }

  message.reply(response);
};
