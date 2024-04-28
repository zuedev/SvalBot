import { chatgpt } from "../controllers/openai.js";
import log from "../library/log.js";

/**
 * Uses OpenAI's ChatGPT to answer a question.
 * @param {string} question The question to answer
 * @param {string} user The user to answer the question for
 * @returns {string} The answer to the question
 */
export default async ({ question, user = null }) => {
  try {
    const response = await chatgpt({
      personality:
        "Answer the question to the best of your ability. Try to be as brief as possible.",
      promptText: question,
      user,
    });

    return response;
  } catch (error) {
    log(error);
    return "I'm sorry, but I can't respond to that.";
  }
};
