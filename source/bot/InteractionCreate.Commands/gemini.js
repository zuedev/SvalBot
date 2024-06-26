import { SlashCommandBuilder } from "@discordjs/builders";
import getClientApplicationOwner from "#bot/helpers/getClientApplicationOwner.js";
import { VertexAI } from "@google-cloud/vertexai";
import { convert } from "html-to-text";

export default {
  data: new SlashCommandBuilder()
    .setName("gemini")
    .setDescription("Replies with a response from Google Gemini.")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("The prompt to get a response for.")
        .setRequired(true)
    ),
  async execute({ interaction }) {
    const owner = await getClientApplicationOwner(interaction.client);
    if (interaction.user.id !== owner.id)
      return interaction.reply("You are not authorized to use this command.");

    try {
      const prompt = interaction.options.getString("prompt");

      await interaction.deferReply();
      await interaction.channel.sendTyping();

      const response = await getResponse(prompt);

      // is the reponse more than 2000 characters?
      if (response.length > 2000)
        return interaction.followUp({
          content:
            "Sending the response as a file as it's too long to send as a message.",
          files: [
            {
              attachment: Buffer.from(response),
              name: "response.txt",
            },
          ],
        });

      return interaction.followUp(response);
    } catch (error) {
      console.error(error);

      return interaction.followUp(
        "Failed to get a response from Google Gemini."
      );
    }
  },
};

async function getResponse(prompt) {
  const vertex_ai = new VertexAI({
    project: "svalbot",
    location: "us-central1",
    googleAuthOptions: {
      credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON),
    },
  });

  const generativeModel = vertex_ai.preview.getGenerativeModel({
    model: "gemini-experimental",
    generationConfig: {
      maxOutputTokens: 8192,
      candidateCount: 1,
    },
  });

  // does the prompt contain a url? if so, fetch it and convert it to text
  if (prompt.match(/https?:\/\/\S+/)) {
    const url = prompt.match(/https?:\/\/\S+/)[0];
    const html = await (await fetch(url)).text();
    // remove url from prompt
    prompt = prompt.replace(url, "");
    prompt = prompt + "\n\n" + "Reference from URL:\n\n" + convert(html);
  }

  const response = await generativeModel.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  return response.response.candidates[0].content.parts[0].text;
}
