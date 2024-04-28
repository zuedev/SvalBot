import answerQuestion from "../../commands/answerQuestion.js";

/**
 * Replies with the answer to the question.
 * @param {Object} param0.message - The message object.
 * @param {string[]} param0.args - The arguments.
 * @returns {Promise<void>} A promise that resolves when the command is handled.
 */
export default async ({ message, args }) => {
  let question = args.join(" ");

  const response = answerQuestion({ question, user: message.author.id });

  message.reply(response);
};
