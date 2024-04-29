import answerQuestion from "#commands/answerQuestion.js";
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

  const response = await answerQuestion({ question, user: message.author.id });

  message.reply(response);
};
