import type { Schema } from '../resource';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

import { StringOutputParser } from '@langchain/core/output_parsers';
import OpenAI from 'openai';

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
   - When prompted with "Generate picture" or "Imagine" for Cinderella, create an image of Cinderella as a single character in her blue ball gown, focusing on her distinctive golden hair, glass slippers, and gentle expression. Keep the background neutral or subtly blurred to maintain focus on Cinderella.
   - If the user specifies secondary characters, include them alongside Cinderella in supporting positions but ensure Cinderella remains the main focus.

3. **Wrong Query Response**:
   - For any unrelated requests, respond with: "This AI is specialized in fairy tale descriptions and image generation only."
`.trim();

export const handler: Schema['GptMessage']['functionHandler'] = async (
	event
) => {
	const generateImg = async (content: string) => {
		const imgGpt = await openai.images.generate({
			model: 'dall-e-3',
			prompt: content,
			size: '1024x1024',
			quality: 'standard',
			n: 1,
		});

		return imgGpt.data[0].url!;
	};

	/* 	const tools: ChatCompletionTool[] = [
		{
			type: 'function',
			function: {
				name: 'generate_img',
				description:
					"generate img. Call this whenever you need to generate img, for example when a user message begin only with Genarate img 'Genetare img alisa from alisa in wonder country'",
				parameters: {
					type: 'object',
					properties: {
						content: {
							type: 'string',
							description: 'The prompt for generate img',
						},
					},
					required: ['content'],
					additionalProperties: false,
				},
			},
		},
	]; */

	const openai = new OpenAI({
		apiKey: process.env.API_KEY,
	});

	/* 	const response = await openai.chat.completions.create({
		model: 'gpt-4o',
		messages: [
			{
				role: 'system',
				content: META_PROMPT,
			},
			{
				role: 'user',
				content: event.arguments.content,
			},
		],
		tools: tools,
	}); */

	/* 	const raw = {
		key: process.env.STABLE_KEY,
		prompt: event.arguments.content,
		negative_prompt: null,
		width: '512',
		height: '512',
		samples: '1',
		num_inference_steps: '20',
		seed: null,
		guidance_scale: 7.5,
		safety_checker: 'yes',
		multi_lingual: 'no',
		panorama: 'no',
		self_attention: 'no',
		upscale: 'no',
		embeddings_model: null,
		webhook: null,
		track_id: null,
	}; */

	/* const imgStable = await axios.post(
		'https://stablediffusionapi.com/api/v3/text2img',
		raw,
		{
			headers: {
				'Content-Type': 'application/json',
			},
		}
	); */

	/* 	const toolCall = response?.choices?.[0]?.message?.tool_calls?.[0];
	const content = response?.choices?.[0]?.message?.content;

	if (toolCall) {
		const arguments1 = JSON.parse(toolCall.function.arguments);
		const content = arguments1.content;

		const imgUrl = await generateImg(content);
		return {
			imgGpt: imgUrl!,
			imgStable: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_F...',
		};
	} else {
		return {
			imgStable: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_F...',
			content: content!,
		};
	} */

	const lang = new ChatOpenAI({ apiKey: process.env.API_KEY, model: 'gpt-4o' });
	const messages = [
		new SystemMessage(
			` Analyze the user's text and respond accordingly.
				Respond in one of the following three ways:

				1. If the request is to describe a character from a fairy tales, respond with text. text
				2. If the request is to generate an image based on the provided description, respond with an image. image
				3. For any other requests, respond with "I only specialize in fairy tale descriptions and image creation. Please make the correct request." wrong
			`
		),
		new HumanMessage(event.arguments.content),
	];

	const res = await lang.invoke(messages);
	const parser = new StringOutputParser();
	const resParser = await parser.invoke(res);

	if (resParser === 'text') {
		const messages1 = [
			new SystemMessage(META_PROMPT),
			new HumanMessage(event.arguments.content),
		];

		const res1 = await lang.invoke(messages1);
		const parser1 = new StringOutputParser();
		const resParser1 = await parser1.invoke(res1);

		return { content: resParser1 };
	} else if (resParser === 'image') {
		return {imgGpt: await generateImg(event.arguments.content)}
	} else {
		return { content: resParser };
	}
};