export default defineNuxtConfig({
  modules: ['../src/module'],

  devtools: { enabled: true },
  compatibilityDate: '2025-01-30',

  gpt: {
    apiKey: process.env.OPENAI_API_KEY,
  },
})
