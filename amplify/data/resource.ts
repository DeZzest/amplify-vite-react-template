import {
	type ClientSchema,
	a,
	defineData,
	defineFunction,
	secret,
} from '@aws-amplify/backend';

const echoHandler = defineFunction({
	entry: './gptMessageResponce-handler/handler.ts',
	environment: {
		API_KEY: secret('api_key'),
	},
	timeoutSeconds: 30,
});

const schema = a.schema({
	User: a
		.model({
			email: a.string().required(),
			messages: a.hasMany('Message', 'userId'),
			savedMessages: a.hasMany('SavedMessage', 'userId'),
			chatParticipants: a.hasMany('ChatParticipant', 'userId'),
		})
		.authorization((allow) => [allow.authenticated(), allow.owner()]),

	Message: a
		.model({
			content: a.string().required(),
			userId: a.id(),
			chatId: a.id(),
			user: a.belongsTo('User', 'userId'),
			chat: a.belongsTo('Chat', 'chatId'),
		})
		.authorization((allow) => [allow.authenticated(), allow.owner()]),

	Chat: a
		.model({
			id: a.id(),
			messages: a.hasMany('Message', 'chatId'),
			chatParticipants: a.hasMany('ChatParticipant', 'chatId'),
		})
		.authorization((allow) => [allow.authenticated(), allow.owner()]),

	ChatParticipant: a
		.model({
			userId: a.id(),
			chatId: a.id(),
			user: a.belongsTo('User', 'userId'),
			chat: a.belongsTo('Chat', 'chatId'),
		})
		.authorization((allow) => [allow.authenticated(), allow.owner()]),

	SavedMessage: a
		.model({
			content: a.string(),
			userId: a.id(),
			user: a.belongsTo('User', 'userId'),
			sender: a.string(),
			chatId: a.id(),
			isSaved: a.boolean(),
		})
		.authorization((allow) => [allow.authenticated(), allow.owner()]),

	GptMessageResponce: a.customType({
		imgGpt: a.string().required(),
		imgStable: a.string().required(),
	}),

	GptMessage: a
		.query()
		.arguments({ content: a.string().required() })
		.returns(a.ref('GptMessageResponce').required())
		.authorization((allow) => [allow.authenticated()])
		.handler(a.handler.function(echoHandler)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
	schema,
	authorizationModes: {
		defaultAuthorizationMode: 'userPool', // userPool or apiKey
		apiKeyAuthorizationMode: {
			//
			expiresInDays: 30,
		},
	},
});
