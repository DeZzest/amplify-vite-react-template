import OpenAI from 'openai';
import type { Schema } from '../resource';

export const handler: Schema['GptMessage']['functionHandler'] = async (
	event
) => {
	const openai = new OpenAI({
		apiKey: process.env.API_KEY,
	});

	const completion = await openai.chat.completions.create({
		model: 'gpt-4o',

		messages: [
			{ role: 'system', content: 'You are a helpful assistant.' },
			{
				role: 'user',
				content: event.arguments.content!,
			},
		],
	});

	return {
		content: completion.choices[0].message.content!,
	};
};
