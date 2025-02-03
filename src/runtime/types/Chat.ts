import type { Message } from './Message'

export type Chat = {
  id: string
  status: 'idle' | 'thinking' | 'streaming'
  messages: Message[]
}
