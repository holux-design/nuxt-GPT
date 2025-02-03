import { defineEventHandler } from 'h3'
import * as jose from 'jose'

// @ts-ignore
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
   return await new jose.SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1sec')
      .sign(
         new TextEncoder().encode(useRuntimeConfig().gpt.securityTokenSecret),
      )
})
