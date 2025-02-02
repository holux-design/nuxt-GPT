import { defineEventHandler, getRequestURL, useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
   if (getRequestURL(event).pathname.includes('/api/chat-gpt/')) {
      event.context.auth = {
         ...event.context.auth,
         gpt: { apiKey: useRuntimeConfig().gpt.apiKey },
      }
   }
})
