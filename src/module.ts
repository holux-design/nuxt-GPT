import { fileURLToPath } from 'node:url'
import {
  defineNuxtModule,
  createResolver,
  addImports,
  addServerHandler,
  addPlugin,
} from '@nuxt/kit'
import defu from 'defu'
import type { MODEL } from './runtime/types/Model'
import type { VOICE } from './runtime/types/Voice'
import { uuidv4 } from './runtime/utils/uuid'

// Module options TypeScript interface definition
export interface ModuleOptions {
  apiKey: string
  protectAPI: boolean
  model: MODEL
  voice: VOICE
}

const configKey = 'gpt'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-gpt',
    configKey,
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  // Default configuration options of the Nuxt module
  defaults: {
    model: 'gpt-4o-mini',
    voice: 'alloy',
  },
  setup(_options, _nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))

    if (!_options.apiKey) {
      return console.warn(`[nuxt-gpt]: No apiKey provided in nuxt.config`)
    }

    _nuxt.options.runtimeConfig[configKey] = defu(
      _nuxt.options.runtimeConfig[configKey] as any,
      {
        apiKey: _options.apiKey,
        model: _options.model,
        voice: _options.voice,
        tokenSecret: uuidv4(),
      },
    )

    addImports({
      name: 'useGPT',
      as: 'useGPT',
      from: resolve('runtime/composables/useGPT'), // load composable from plugin
    })

    addServerHandler({
      route: '/api/chat-gpt/functions/structured-chat-completion',
      method: 'post',
      handler: resolve(
        runtimeDir,
        'server/api/chat-gpt/functions/structured-chat-completion',
      ),
    })
    addServerHandler({
      route: '/api/chat-gpt/functions/chat',
      method: 'post',
      handler: resolve(runtimeDir, 'server/api/chat-gpt/functions/chat'),
    })
    addServerHandler({
      route: '/api/chat-gpt/functions/text-to-speech',
      method: 'post',
      handler: resolve(
        runtimeDir,
        'server/api/chat-gpt/functions/text-to-speech',
      ),
    })

    if (_options.protectAPI != false) {
      addServerHandler({
        route: '',
        middleware: true,
        handler: resolve(runtimeDir, 'server/middleware/chat-gpt-auth'),
      })

      addPlugin(resolve(runtimeDir, 'plugins/gpt-generate-token'))
    }

    _nuxt.options.build.transpile.push(runtimeDir)
  },
})
