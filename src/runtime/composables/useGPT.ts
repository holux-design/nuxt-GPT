import type { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import type { AUDIO_MODEL } from '../utils/audio_models'
import type { VOICE } from '../utils/voices'
import { uuidv4 } from '../utils/uuid'
import { now } from '../utils/time'
import { ref } from '#imports'

const message = ref<string>('')
const chatHistory = ref<{ [chatID: string]: Message[] }>({})

/**
 * AI Utility Hook
 * @param {string} [prompt] - initial prompt to set the message. Optional if used with `.createChat()`
 * @returns {object} AI functions for structured output, speech synthesis, messaging, and chat handling.
 */
export const useGPT = (prompt?: string) => {
  if (prompt) message.value = prompt

  return {
    toStructured,
    toSpeech,
    /**
     * Sends the previous message and retrieves the answer.
     * @returns {Promise<{ answer: string }>} The assistant's response.
     */
    send: async () => await sendInitialMessage(),
    addContextData,
    createChat,
  }
}

/**
 * Sends the the message with requested type and returns response in the requested schema
 * @template T
 * @param {z.ZodObject<any>} responseSchema - The schema for the structured response as ZOD.
 * @returns {Promise<T>} The structured AI response according to the provided schema.
 */
const toStructured = async <T>(
  responseSchema: z.ZodObject<any>,
): Promise<T> => {
  return (await $fetch('/api/chat-gpt/structured-chat-completion', {
    method: 'POST',
    body: {
      message: message.value,
      responseSchema: zodToJsonSchema(responseSchema, 'schema')!.definitions!
        .schema,
    },
  })) as T
}

const sendChatMessage = async (
  prompt: string,
  chatUUID: string,
): Promise<{ answer: string }> => {
  const userMessage: Message = {
    role: 'user',
    content: prompt,
    datetime_js: now(),
  }

  chatHistory.value[chatUUID].push(userMessage)

  const response: any = await $fetch('/api/chat-gpt/chat', {
    method: 'POST',
    body: {
      messages: chatHistory.value[chatUUID],
    },
  })

  const answer = response[0].message?.content

  chatHistory.value[chatUUID].push({
    role: 'assistant',
    content: answer,
    datetime_js: now(),
  })

  return { answer }
}

const sendInitialMessage = async (): Promise<{ answer: string }> => {
  const response: any = await $fetch('/api/chat-gpt/chat', {
    method: 'POST',
    body: {
      messages: [{ role: 'user', content: message.value }],
    },
  })

  return { answer: response[0].message?.content }
}

/**
 * Adds context data to the message for GPT to work with.
 * @param {any} contextData - The context data to include.
 * @returns {object} Functions to send and structure responses.
 */
const addContextData = (contextData: any) => {
  try {
    message.value += `Use this JSON data: ${JSON.stringify(contextData)}`
  }
  catch (err) {
    console.error(
      '[useGPT -> addContextData] Failed to parse contextData to JSON',
      err,
    )
  }

  return { send: sendInitialMessage, toStructured }
}

/**
 * Converts the previous message to speech and returns a Base64 audio string.
 * @param {{ voice?: VOICE, model?: AUDIO_MODEL }} [options] - Optional speech settings.
 * @returns {Promise<string>} Base64-encoded MP3 audio.
 */
const toSpeech = async (options?: {
  voice?: VOICE
  model?: AUDIO_MODEL
}): Promise<Base64URLString> => {
  const audioBase64: string = await $fetch('/api/chat-gpt/text-to-speech', {
    method: 'POST',
    body: {
      input: message.value,
      model: options?.model || 'tts-1',
      voice: options?.voice,
    },
  })

  return `data:audio/mp3;base64,${audioBase64}`
}

type Message = {
  role: 'system' | 'user' | 'assistant'
  content: string
  datetime_js: number
}
/**
 * Starts a new chat session with an optional system prompt to prime the Assistant.
 * @param {string} [systemPrompt] - Optional initial system message.
 * @returns {{ uuid: string; messages: Message[], send:Function}} Chat session object with UUID and messaging functionality.
 */
const createChat = (systemPrompt?: string) => {
  const chatUUID = uuidv4()
  chatHistory.value[chatUUID] = []

  if (systemPrompt)
    chatHistory.value[chatUUID].push({
      role: 'system',
      content: systemPrompt,
      datetime_js: now(),
    })
  return {
    uuid: chatUUID,
    messages: chatHistory.value[chatUUID],
    /**
     * Sends a chat message asynchronously and optionally calls a onSubmit callback.
     *
     * @param {string} prompt - The message to be sent in the chat.
     * @param {Function} [onSubmit] - An optional callback function to execute before sending the message. E.g. reseting the input.
     * @returns {Promise<void>} A promise that resolves when the message is sent.
     */
    send: async (prompt: string, onSubmit?: Function) => {
      !!onSubmit && onSubmit()
      await sendChatMessage(prompt, chatUUID)
    },
  }
}
