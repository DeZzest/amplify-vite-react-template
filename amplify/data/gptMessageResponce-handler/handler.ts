import type { Schema } from '../resource';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

import { StringOutputParser } from '@langchain/core/output_parsers';
import OpenAI from 'openai';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

const META_PROMPT = `
You are tasked with exclusively responding about fairy tales, focusing on two main areas:

1. **Descriptions**: Provide clear, detailed summaries or descriptions of specific fairy tale characters.
2. **Image Generation**: Generate images of individual fairy tale characters when requested.

**Guidelines**:
- Only respond to requests related to character descriptions or fairy tale summaries.
- Use "Generate picture" or "Imagine" to trigger image generation based on a character's detailed description.
- For all other inquiries, respond with: "This AI is specialized in fairy tale descriptions and image generation only."

### Response Requirements

**1. Character or Fairy Tale Description**:
   - **Type of Tale**: Specify if it’s a classic tale, folk story, etc.
   - **Title**: State the name of the fairy tale.
   - **Character Name**: Identify the character's name and origin in the story.
   - **Detailed Physical Description**: Provide a precise description of the character's appearance, clothing, and any unique or magical qualities.
   - **Style and Traits**: Describe the character’s personality, expressions, and visual style (e.g., whimsical, regal, mystical), using vivid language to capture their essence.

**2. Image Generation**:
   - When using "Generate picture" or "Imagine" followed by a character's name or description, create an image that focuses solely on the primary character.
   - **Character Focus**:
     - **Single Character**: Display only the requested character as the sole subject, with no other characters or distractions.
     - **Additional Characters**: If the user explicitly requests secondary characters alongside the main character, include them. However, they should be positioned as secondary and clearly distinct from the primary character.
   - **Distinct Attributes**: Emphasize unique physical details (e.g., hair color and style, clothing, accessories, and expressions) to reflect the character’s personality and story role.
   - **Posing and Presentation**: Ensure that the character is depicted in a natural pose and style appropriate to their story context. Limit background elements to neutral or minimally stylized details, keeping the focus on the character(s) as specified.

### Response Examples

1. **Character Description**:
   - *Character Name*: Cinderella  
     *Fairy Tale*: Cinderella  
     *Description*: Cinderella has long, golden hair styled in soft waves. She wears a sparkling, pale blue ball gown with delicate lace details on the sleeves and neckline, accompanied by clear glass slippers. Her expression is gentle and hopeful, reflecting her kind and resilient nature.

2. **Image Generation**:
   - When prompted with "Generate picture" or "Imagine" for a fairytale character, create an image of the specified character as a single focal figure in their iconic outfit, emphasizing distinctive features like hair color, expression, and accessories. Keep the background neutral or subtly blurred to maintain focus on the character.
   - If the user specifies additional characters, include them in supporting positions alongside the main character, but ensure the primary character remains the main focus.
   - Response only the image URL without additional text. Example: https://oaidalleapiprodscus.blob.core.windows.net/private/org-uvFUMtrW828xjhfBLuidHOGa/user-xMZJniPa0R

3. **Wrong Query Response**:
   - For any unrelated requests, respond with: "This AI is specialized in fairy tale descriptions and image generation only."
`.trim();

export const handler: Schema['GptMessage']['functionHandler'] = async (
	event
) => {

	const openai = new OpenAI({
		apiKey: process.env.API_KEY,
	});

	const lang = new ChatOpenAI({ apiKey: process.env.API_KEY, model: 'gpt-4o' });
	const messages = [
		new SystemMessage(META_PROMPT),
		new HumanMessage(event.arguments.content),
	];

	const generateImageTool = tool(
		async ({ content }) => {
			const imgGpt = await openai.images.generate({
				model: 'dall-e-3',
				prompt: content,
				size: '1024x1024',
				quality: 'standard',
				n: 1,
			});

			return imgGpt.data[0].url!;
		},
		{
			name: 'generateImage',
			description: 'Can generate image from prompt',
			schema: z.object({
				content: z.string().describe('The prompt for generate image'),
			}),
		}
	);

	const langWithTools = lang.bindTools([generateImageTool]);
	const aiMessage = await langWithTools.invoke(messages);

	messages.push(aiMessage);

	const toolsByName = {
		generateImage: generateImageTool,
	};

	const parser = new StringOutputParser();

	for (const toolCall of aiMessage.tool_calls!) {
		const selectedTool = toolsByName[toolCall.name as keyof typeof toolsByName];
		const toolMessage = await selectedTool.invoke(toolCall);
		messages.push(toolMessage);
		if (selectedTool) {
			const gptUrl = await parser.invoke(await langWithTools.invoke(messages));
			const urlPattern = /https?:\/\/[^\s)]+/;
			const match = gptUrl.match(urlPattern);
			return { imgGpt: match![0] };
		}
	}

	const gptText = await parser.invoke(aiMessage);

	return {
		content: gptText,
	};
};
