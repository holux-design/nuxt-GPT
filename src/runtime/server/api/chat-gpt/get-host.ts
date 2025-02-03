import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
   return {
      host: getRequestURL(event).host,
   }
})
