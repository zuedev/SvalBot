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
 * Get a response from ChatGPT
 *
 * @param {string} prompt The prompt to get a response for
 * @param {string[]} [conversation=[]] The conversation to add to the prompt
 * @param {string} [personality="You are a helpful assistant."] The personality to use
 * @param {string} [model="gpt-4"] The model to use
 * @param {string} [user="unknown"] The user to use
 * @param {number} [temperature=2] The temperature to use
 * @param {number} [max_tokens=2048] The maximum number of tokens to use
 * @param {boolean} [bypass_moderation=false] Whether to bypass the moderation filter
 *
 * @returns {Promise<string>} The completed prompt
 *
 * @example chatgpt({ prompt: "What is the capital of Spain?"}); // "Madrid"
 */
export async function chatgpt({
  promptText = null,
  promptImageUrl = null,
  conversation = [],
  basePersonality = "Your name is SvalBot, a multi-purpose Discord bot for helping people do things on Discord. You are made by zuedev and are powered by OpenAI.",
  personality = "",
  model = "gpt-4-turbo",
  user = "unknown",
  temperature = 1,
  max_tokens = 2048,
  bypass_moderation = false,
}) {
  try {
    // gotta have either text or image prompt
    if (!promptText && !promptImageUrl)
      return "You must provide either a text or image prompt.";

    if (!bypass_moderation && promptText) {
      try {
        const { flagged } = await moderation(promptText);

        if (flagged) return "I'm sorry, but I can't respond to that.";
      } catch (error) {
        console.error(error);

        return {
          error: "There was an error checking the prompt for moderation.",
        };
      }
    }

    // if an image is provided, we need to make sure it's a valid image
    if (promptImageUrl) {
      const validImageExtensions = ["png", "jpg", "jpeg", "webp", "gif"];

      const extension = promptImageUrl
        .split(".")
        .pop()
        .split("?")[0]
        .toLowerCase();

      if (!validImageExtensions.includes(extension))
        return (
          "You must provide a valid image prompt. We currently support " +
          validImageExtensions.join(", ") +
          "."
        );
    }

    const userPromptContent = [];

    if (promptText) userPromptContent.push({ type: "text", text: promptText });
    if (promptImageUrl)
      userPromptContent.push({ type: "image_url", image_url: promptImageUrl });

    // if we get an image without text, we need to add a space to the prompt
    if (promptImageUrl && !promptText)
      userPromptContent.push({ type: "text", text: " " });

    const response = await openai.chat.completions.create({
      messages: [
        { role: "system", content: `${basePersonality} ${personality}` },
        ...conversation,
        {
          role: "user",
          content: userPromptContent,
        },
      ],
      model,
      user,
      temperature,
      max_tokens,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error(error);

    return { error: "There was an error generating the response." };
  }
}

export async function dalle({
  prompt,
  model = "dall-e-3",
  size = "1024x1024",
  user = "unknown",
  bypass_moderation = false,
  style = "vivid",
}) {
  try {
    if (!bypass_moderation) {
      const { flagged } = await moderation(prompt);

      if (flagged)
        return {
          status: 400,
          message: "I'm sorry, but I can't generate an image for that.",
        };
    }

    const options = {
      model,
      prompt,
      size,
      user,
    };

    if (model === "dall-e-3") {
      options.n = 1;
      // options.quality = "hd";
      options.style = style;
    }

    const response = await openai.images.generate(options);

    return { status: 200, url: response.data[0].url };
  } catch (error) {
    console.error(error);

    return {
      status: 500,
      message:
        "There was an error generating the image. Please try again later.",
    };
  }
}

export async function tts({
  model = "tts-1-hd",
  voice = "alloy",
  input,
  speed = 1,
  bypass_moderation = false,
}) {
  if (!bypass_moderation) {
    const { flagged } = await moderation(input);

    if (flagged)
      return {
        error: {
          status: 400,
          message: "I'm sorry, but I can't generate audio for that.",
        },
      };
  }

  const response = await openai.audio.speech.create({
    model,
    voice,
    input,
    speed,
  });

  return Buffer.from(await response.arrayBuffer());
}

export default { moderation, chatgpt, dalle };
