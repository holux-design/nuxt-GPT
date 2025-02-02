import OpenAI from 'openai'
import { createError, defineEventHandler, readBody } from 'h3'

// @ts-ignore
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
   let { input, model, voice } = await readBody(event)

   const apiKey = event.context.auth?.gpt?.apiKey
   if (!apiKey) {
      throw createError({
         statusCode: 403,
         message: 'External access is forbidden for this route.',
      })
   }

   const openai = new OpenAI({ apiKey })

   try {
      const mp3 = await openai.audio.speech.create({
         model,
         voice: voice || useRuntimeConfig().gpt.voice,
         input,
      })

      const arrayBuffer = await mp3.arrayBuffer() // Save the output as an ArrayBuffer
      return Buffer.from(arrayBuffer).toString('base64')
   } catch (error: any) {
      throw createError({
         statusCode: 500,
         message: error?.message || 'Failed to forward request to OpenAI API',
      })
   }
})
