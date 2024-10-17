import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  User: a
    .model({
      email: a.string(),
      messages: a.hasMany('Message', 'userId'), // Повідомлення, що користувач надіслав
      savedMessages: a.hasMany('SavedMessage', 'userId'), // Збережені повідомлення
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.owner(),
    ]),

  Message: a
    .model({
      content: a.string(),
      userId: a.id(),
      user: a.belongsTo('User', 'userId'),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.owner(),
    ]),

  SavedMessage: a // Новий тип для збережених повідомлень
    .model({
      content: a.string(),
      userId: a.id(),
      user: a.belongsTo('User', 'userId'),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.owner(),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey', // userpool
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
