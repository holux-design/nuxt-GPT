import OpenAI from 'openai'
import { createError, defineEventHandler, readBody } from 'h3'

// @ts-ignore
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
   const { messages } = await readBody(event)

   const apiKey = event.context.auth?.gpt?.apiKey
   if (!apiKey) {
      throw createError({
         statusCode: 403,
         message: 'External access is forbidden for this route.',
      })
   }

   const openai = new OpenAI({ apiKey })

   try {
      const completion = await openai.chat.completions.create({
         model: useRuntimeConfig().gpt?.model || 'gpt-4o-mini',
         messages,
      })

      return completion.choices
   } catch (error: any) {
      throw createError({
         statusCode: 500,
         message: error?.message || 'Failed to forward request to OpenAI API',
      })
   }
})
