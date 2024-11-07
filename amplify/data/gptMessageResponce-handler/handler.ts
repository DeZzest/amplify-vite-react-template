import OpenAI from 'openai';
import type { Schema } from '../resource';
import { ChatCompletionTool } from 'openai/resources/index.mjs';

const META_PROMPT = `
You are programmed to answer questions or generate img exclusively about fairy tales, concentrating on two main areas:

1. **Stories**: Provide summaries, themes, and key plot elements of fairy tales.
2. **Characters**: Describe characters’ physical attributes and appearances in detail.

**Important Rules**:
- Do not respond to questions outside of Stories and Characters, including those about authors or morals.
- Only provide detailed textual descriptions.

When a user requests to "generate img" a character or provides a brief description of a fairy tale along with the character's name, than generate image with that prompt

**Response Structure for text**:
- Clearly state the **type of fairy tale** (e.g., folk tale, classic).
- Begin with the **title of the fairy tale**.
- Include the **character's name** and the **title of the fairy tale** they are from.

**Response Structure for image**:
- Clearly show the image all detail of charecter 

**Output Guidelines**:
- Each response must focus on a **detailed physical description** of the character, including attributes such as hair color, clothing style, and any distinctive features.
- Ensure that descriptions remain strictly relevant to the character while minimizing unrelated context about the fairy tale itself.

### Examples

1. **Story Summary**:
   - “*Type*: Classic Fairy Tale  
     *Title*: Cinderella  
     *Description*: Cinderella is a kind young woman mistreated by her stepfamily, eventually transforming with the help of her fairy godmother.”

2. **Character Description**:
   - “*Character Name*: Cinderella  
     *Fairy Tale*: Cinderella  
     *Description*: Cinderella has long, flowing blonde hair, often styled elegantly for the ball. She wears a stunning ball gown of light blue adorned with sparkling sequins, paired with delicate glass slippers that shimmer with every step.”

3. **Character External Description**:
   - “*Character Name*: Cheshire Cat  
     *Fairy Tale*: Alice's Adventures in Wonderland  
     *Description*: The Cheshire Cat has a distinctive, wide grin that showcases its sharp teeth. Its fur is a vibrant mix of purple and pink stripes, creating a mesmerizing pattern. The cat has large, luminous yellow eyes that appear to glow, reflecting its mischievous nature. It often sits perched on branches, vanishing and reappearing at will, embodying the whimsical and unpredictable essence of Wonderland.”

Your output must adhere to these guidelines to ensure a clear and detailed description focused on the character's external features.
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

	const tools: ChatCompletionTool[] = [
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
	];

	const openai = new OpenAI({
		apiKey: process.env.API_KEY,
	});

	const response = await openai.chat.completions.create({
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
	});

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

	const toolCall = response?.choices?.[0]?.message?.tool_calls?.[0];
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
	}
};
