import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Check if a prompt passes OpenAI's moderation filter
 *
 * @param {string} input The prompt to check
 *
 * @returns {Promise<{ flagged: boolean, category: string }>} Whether the prompt was flagged and the category of the flag
 *
 * @example moderation("I hate you"); // { flagged: true, category: "hate" }
 */
export async function moderation(input) {
  const response = await openai.moderations.create({
    input,
  });

  const results = response.results[0];

  const { flagged, category } = results;

  return { flagged, category };
}

/**
 * Get a response from ChatGPT.
 *
 * @param {string} prompt The prompt to send to ChatGPT
 * @param {string} user The user ID
 * @param {object[]} conversation The conversation history
 * @param {string} personality The personality to use
 *
 * @returns {Promise<{ status: number, response?: string, message?: string }>} The status code and response
 */
export async function chatgpt({
  prompt,
  user = "unknown",
  conversation = [],
  personality = "",
}) {
  try {
    const { flagged } = await moderation(prompt);

    if (flagged)
      return {
        status: 400,
        message: "Failed moderation.",
      };

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: personality },
        ...conversation,
        { role: "user", content: prompt },
      ],
      user,
    });

    return { status: 200, response: response.choices[0].message.content };
  } catch (error) {
    console.error(error);

    return {
      status: 500,
      message: "Catch-all error.",
    };
  }
}

/**
 * Create an image with DALL-E.
 *
 * @param {string} prompt The prompt to send to DALL-E
 * @param {string} user The user ID
 * @param {string} size The size of the image
 * @param {string} style The style of the image
 *
 * @returns {Promise<{ status: number, image?: string, message?: string }>} The status code and image URL
 */
export async function dalle({
  prompt,
  user = "unknown",
  size = "1024x1024",
  style = "vivid",
}) {
  try {
    const { flagged } = await moderation(prompt);

    if (flagged)
      return {
        status: 400,
        message: "Failed moderation.",
      };

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size,
      style,
      user,
    });

    return { status: 200, url: response.data[0].url };
  } catch (error) {
    console.error(error);

    return {
      status: 500,
      message: "Catch-all error.",
    };
  }
}

/**
 * Generate audio with Text-to-Speech.
 *
 * @param {string} input The text to convert to speech
 * @param {string} voice The voice to use
 * @param {number} speed The speed of the speech
 *
 * @returns {Promise<{ status: number, buffer?: Buffer, message?: string }>} The status code and audio buffer
 */
export async function tts({ input, voice = "nova", speed = 1 }) {
  try {
    const { flagged } = await moderation(input);

    if (flagged)
      return {
        status: 400,
        message: "Failed moderation.",
      };

    const response = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice,
      input,
      speed,
      response_format: "wav",
    });

    return {
      status: 200,
      buffer: Buffer.from(await response.arrayBuffer()),
    };
  } catch (error) {
    console.error(error);

    return {
      status: 500,
      message: "Catch-all error.",
    };
  }
}

export default { moderation, chatgpt, dalle, tts };
