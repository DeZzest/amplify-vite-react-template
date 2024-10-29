import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  User: a
    .model({
      name: a.string(),
      email: a.string(),
      messages: a.hasMany('Message', 'userId'),
      savedMessages: a.hasMany('SavedMessage', 'userId'),
      chatParticipants: a.hasMany('ChatParticipant', 'userId'),
    })
    .authorization((allow) => [
      //allow.groups(['Admin']).to(['read', 'create', 'update', 'delete']),
      allow.publicApiKey().to(['read']),
      allow.owner(),
    ]),
    
  Message: a
    .model({
      content: a.string(),
      userId: a.id(),
      chatId: a.id(),
      user: a.belongsTo('User', 'userId'),
      chat: a.belongsTo('Chat', 'chatId'),
    })
    .authorization((allow) => [
      //allow.groups(['Admin']).to(['read', 'create', 'update', 'delete']),
      allow.publicApiKey().to(['read']),
      allow.owner(),
    ]),

  Chat: a
    .model({
      id: a.id(),
      messages: a.hasMany('Message', 'chatId'),
      chatParticipants: a.hasMany('ChatParticipant', 'chatId'),
    })
    .authorization((allow) => [
      //allow.groups(['Admin']).to(['read', 'create', 'update', 'delete']),
      allow.publicApiKey().to(['read']),
      allow.owner(),
    ]),

  ChatParticipant: a
    .model({
      userId: a.id(),
      chatId: a.id(),
      user: a.belongsTo('User', 'userId'),
      chat: a.belongsTo('Chat', 'chatId'),
    })
    .authorization((allow) => [
      //allow.groups(['Admin']).to(['read', 'create', 'update', 'delete']),
      allow.publicApiKey().to(['read']),
      allow.owner(),
    ]),

  SavedMessage: a
    .model({
      content: a.string(),
      userId: a.id(),
      user: a.belongsTo('User', 'userId'),
      sender: a.string(),
      chatId: a.id(),
      isSaved: a.boolean(),
    })
    .authorization((allow) => [
      //allow.groups(['Admin']).to(['read', 'create', 'update', 'delete']),
      allow.publicApiKey().to(['read']),
      allow.owner(),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool', // userPool or apiKey
    apiKeyAuthorizationMode: { //
      expiresInDays: 30,
    },
  },
});
