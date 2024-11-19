import type { Schema } from '../resource';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import OpenAI from 'openai';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { ConversationSummaryBufferMemory } from 'langchain/memory';

const META_PROMPT = `
You are tasked with exclusively responding about fairy tales, focusing on two main areas:

1. **Descriptions**: Provide clear, detailed summaries or descriptions of specific fairy tale characters.
2. **Image Generation**: Generate images of individual fairy tale characters when requested, always maintaining a consistent visual style.

**Guidelines**:
- Always generate images in the "Fairy Tales" style, which is characterized by:
  - Soft, magical tones
  - Detailed but gentle textures (e.g., flowing gowns, sparkly accessories, dreamy lighting)
  - Dream-like, ethereal backgrounds that don’t distract from the character
  - A focus on beauty and charm, with a slight fairy tale or mystical essence
- When creating a character's image, do not vary the visual style unless explicitly requested by the user. Always aim for consistency across different images of fairy tale characters.
- For all descriptions and image generation requests, make sure the style remains consistent and true to the defined "Fairy Tales" visual style.

### Response Requirements:

**1. Character or Fairy Tale Description**:
   - **Type of Tale**: Specify if it’s a classic tale, folk story, etc.
   - **Title**: State the name of the fairy tale.
   - **Character Name**: Identify the character's name and origin in the story.
   - **Detailed Physical Description**: Provide a precise description of the character's appearance, clothing, and any unique or magical qualities.
   - **Style and Traits**: Describe the character’s personality, expressions, and visual style (e.g., whimsical, regal, mystical), using vivid language to capture their essence. Always focus on ensuring that the visual style aligns with the "Fairy Tales" style.
   - For example: "The character’s gown is delicate and full of intricate lace and shimmer, with a gentle, ethereal glow, matching the enchanted and graceful essence of the story."

**2. Image Generation**:
   - When prompted with "Generate picture" or "Imagine" for a fairytale character, create an image of the specified character with the "Fairy Tales" style, ensuring all elements like hair, clothing, accessories, and magical traits reflect the description provided.
   - **Character Focus**:
     - **Single Character**: Display only the requested character as the sole subject, with no other characters or distractions, using the "Fairy Tales" style.
     - **Additional Characters**: If the user explicitly requests secondary characters alongside the main character, include them. However, they should be positioned as secondary and clearly distinct from the primary character, all while keeping the main character's appearance in the defined style.
   - **Distinct Attributes**: Emphasize unique physical details (e.g., hair color and style, clothing, accessories, expressions) to reflect the character’s personality and story role while maintaining the consistent "Fairy Tales" style.
   - **Posing and Presentation**: Ensure that the character is depicted in a natural pose and style appropriate to their story context. Limit background elements to neutral or minimally stylized details, keeping the focus on the character(s) as specified. The background should be soft and minimal, to align with the fairy tales aesthetic.

### Response Examples

1. **Character Description**:
   - *Character Name*: Cinderella  
     *Fairy Tale*: Cinderella  
     *Description*: Cinderella has long, golden hair styled in soft waves. She wears a sparkling, pale blue ball gown with delicate lace details on the sleeves and neckline, accompanied by clear glass slippers. Her expression is gentle and hopeful, reflecting her kind and resilient nature. Her gown shimmers in the moonlight, adding to the magical, ethereal quality of the scene, in the classic "Fairy Tales" style.

2. **Image Generation**:
   - When prompted with "Generate picture" or "Imagine" for a fairytale character, create an image of the specified character as a single focal figure in their iconic outfit, emphasizing distinctive features like hair color, expression, and accessories. Keep the background neutral or subtly blurred to maintain focus on the character in a "Fairy Tales" style. 
   - Example: "Generate picture of Cinderella in her sparkling blue gown with a soft, magical glow surrounding her, set against a subtle background of stars and mist."

### Wrong Query Response:
   - For any unrelated requests, respond with: "This AI is specialized in fairy tale descriptions and image generation only."

### Additional Notes:
   - The "Fairy Tales" style should be applied consistently across all generated images to ensure coherence in visual representation.
   - Ensure that the character is always the focal point, and the visual style remains true to the whimsical, magical aesthetic. If the user specifies a different style or asks for variation, respond with: "The current style is set to 'Fairy Tales.' Any changes to the style need to be explicitly requested."

`.trim();

const styleMemory = new ConversationSummaryBufferMemory({
  llm: new ChatOpenAI({ apiKey: process.env.API_KEY, model: 'gpt-4o' }),
  memoryKey: 'style',
});

const combinedPrompt = async (characterDescription: string) => {
  const styleContext = await styleMemory.loadMemoryVariables({});
  const style = styleContext.style || "Default whimsical style.";
  return `${characterDescription}\nStyle: ${style}`;
};

async function compareImages(image1Buffer: Buffer, image2Buffer: Buffer): Promise<boolean> {
  const diffThreshold = 0.5;
  const hash1 = image1Buffer.toString('base64');
  const hash2 = image2Buffer.toString('base64');
  return Math.abs(hash1.length - hash2.length) < diffThreshold;
}

export const handler: Schema['GptMessage']['functionHandler'] = async (event) => {
  const openai = new OpenAI({ apiKey: process.env.API_KEY });
  const memory = new ConversationSummaryBufferMemory({
    llm: new ChatOpenAI({ apiKey: process.env.API_KEY, model: 'gpt-4o' }),
    memoryKey: 'history',
  });

  const lang = new ChatOpenAI({ apiKey: process.env.API_KEY, model: 'gpt-4o' });
  const messages = [
    new SystemMessage(META_PROMPT),
    new HumanMessage(event.arguments.content),
  ];

  console.log('Image generation prompt:', event.arguments.content);

  const generateImageTool = tool(
    async ({ content }: { content: string }) => {
      let previousDescription = '';
      let context = {};
      try {
        context = await memory.loadMemoryVariables({});
        previousDescription = (context as any).history || '';
      } catch (err) {
        console.error('Error loading memory:', err);
      }

      const prompt = await combinedPrompt(content);

      let generatedImage, attempts = 0;

      do {
        const imgGpt = await openai.images.generate({
          model: 'dall-e-3',
          prompt,
          size: '1024x1024',
          n: 1,
        });
        generatedImage = imgGpt.data[0];

        const previousImageBase64 = (context as any).image;
        if (previousImageBase64) {
          const previousImage = Buffer.from(previousImageBase64 || '', 'base64');
          const currentImage = Buffer.from(generatedImage.url || '', 'base64');

          const isSimilar = await compareImages(previousImage, currentImage);
          if (isSimilar) break;

          console.warn('Generated image is not similar. Retrying...');
        } else {
          break;
        }

        attempts++;
      } while (attempts < 3);

      if (attempts === 3) {
        console.error('Unable to generate a similar image after 3 attempts.');
      }

      await memory.saveContext(
        { input: `Generated prompt: ${prompt}` },
        { output: `Image URL: ${generatedImage.url}` }
      );

      return generatedImage.url;
    },
    {
      name: 'generateImage',
      description: 'Can generate image from prompt',
      schema: z.object({
        content: z.string().describe('The prompt for generate image'),
      }),
    }
  );

  await memory.saveContext(
    { input: event.arguments.content },
    { output: 'Processing your request...' }
  );

  const context = await memory.loadMemoryVariables({});
  const updatedMessages = [
    ...messages,
    new SystemMessage(`Previously generated prompt: ${(context as any).history || ''}`),
  ];

  const langWithTools = lang.bindTools([generateImageTool]);
  const aiMessage = await langWithTools.invoke(updatedMessages);

  const parser = new StringOutputParser();

  if (aiMessage.tool_calls) {
    for (const toolCall of aiMessage.tool_calls) {
      if (toolCall.name === 'generateImage') {
        const args = toolCall.args as { content: string };
        const imageURL = await generateImageTool.invoke(args);
        return { imgGpt: imageURL };
      }
    }
  }

  const gptText = await parser.invoke(aiMessage);
  return { content: gptText };
};

