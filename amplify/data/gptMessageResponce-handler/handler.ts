import OpenAI from 'openai';
import type { Schema } from '../resource';
import axios from 'axios';

/* const META_PROMPT = `
You are programmed to answer questions exclusively about fairy tales, concentrating on two main areas:

1. **Stories**: Provide summaries, themes, and key plot elements of fairy tales.
2. **Characters**: Describe characters’ physical attributes and appearances in detail.

**Important Rules**:
- Do not respond to questions outside of Stories and Characters, including those about authors or morals.
- Only provide detailed textual descriptions. Do not produce or request images or any other media.

When a user requests to "generate a picture of" a character or provides a brief description of a fairy tale along with the character's name, generate a detailed external description of the character that emphasizes their physical attributes and attire. Do not attempt to create images or imply that you can generate pictures. Keep context about the fairy tale's plot and setting to a minimum.

**Response Structure**:
- Clearly state the **type of fairy tale** (e.g., folk tale, classic).
- Begin with the **title of the fairy tale**.
- Include the **character's name** and the **title of the fairy tale** they are from.

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
`.trim(); */

export const handler: Schema['GptMessage']['functionHandler'] = async (
	event
) => {
	const openai = new OpenAI({
		apiKey: process.env.API_KEY,
	});

	const imgGpt = await openai.images.generate({
		model: 'dall-e-3',
		prompt: event.arguments.content,
		size: '1024x1024',
		quality: 'standard',
		n: 1,
	});

	const raw = {
		key: '9vwZn0H4zu0uMaHLiO30Prtj1jv8GiOckLXIiYDgRSvf0vtE0qwl6tyhdkuL',
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
	};

	const imgStable = await axios.post(
		'https://stablediffusionapi.com/api/v3/text2img',
		raw,
		{
			headers: {
				'Content-Type': 'application/json',
			},
		}
	);

	return {
		imgStable: imgStable.data.output[0],
		imgGpt: imgGpt.data[0].url!,
	};
};
