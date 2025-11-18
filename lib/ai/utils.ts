import { streamText, generateText } from './langsmith'
import { google } from '@ai-sdk/google'

export async function streamAIResponse(prompt: string) {
  const result = await streamText({
    model: google('gemini-pro'),
    prompt,
  })

  return result
}

export async function generateAIResponse(prompt: string) {
  const result = await generateText({
    model: google('gemini-pro'),
    prompt,
  })

  return result
}

