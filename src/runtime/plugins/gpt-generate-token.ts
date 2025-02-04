import * as jose from 'jose'

export default defineNuxtPlugin({
  name: 'gpt-auth',
  enforce: 'pre', // or 'post'
  hooks: {
    'app:rendered'() {
      if (import.meta.server) {
        const nuxtApp = useNuxtApp()
        new jose.SignJWT({})
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime('3h')
          .sign(
            new TextEncoder().encode(
              (useRuntimeConfig() as any).gpt.tokenSecret,
            ),
          )
          .then(token => (nuxtApp.$config.public.gpt = { token }))
      }
    },
  },
})
