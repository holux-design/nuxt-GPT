import OpenAI from 'openai'
import { createError, defineEventHandler, readBody } from 'h3'

// @ts-ignore
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
   const { message, responseSchema } = await readBody(event)

   const apiKey = event.context.auth?.gpt?.apiKey
   if (!apiKey) {
      throw createError({
         statusCode: 403,
         message: 'External access is forbidden for this route.',
      })
   }

   const openai = new OpenAI({ apiKey })

   try {
      const completion = await openai.beta.chat.completions.parse({
         model: useRuntimeConfig().gpt?.model || 'gpt-4o-mini',
         messages: [{ role: 'user', content: message }],
         response_format: {
            type: 'json_schema',
            json_schema: {
               name: 'responseSchema',
               strict: true,
               schema: responseSchema,
            },
         },
      })

      return completion.choices[0].message.parsed
   } catch (error: any) {
      throw createError({
         statusCode: 500,
         message: error?.message || 'Failed to forward request to OpenAI API',
      })
   }
})
