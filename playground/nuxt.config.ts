export default defineNuxtConfig({
   modules: ['../src/module'],

   gpt: {
      apiKey: process.env.OPENAI_API_KEY,
   },

   devtools: { enabled: true },
   compatibilityDate: '2025-01-30',
})
