import * as jose from 'jose'
import { defineEventHandler, getRequestURL, useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  if (getRequestURL(event).pathname.includes('/api/chat-gpt/functions/')) {
    const token = event.headers.get('Authorization')
    if (!token)
      throw createError({
        statusCode: 401,
        message: 'No Authorization header present',
      })

    try {
      await jose.jwtVerify(
        token,
        new TextEncoder().encode(
          useRuntimeConfig().gpt.securityTokenSecret,
        ),
        { algorithms: ['HS256'] },
      )
    }
    catch (err) {
      throw createError({
        statusCode: 403,
        message: 'Provided token in Authorization header is not valid',
      })
    }
  }
})
