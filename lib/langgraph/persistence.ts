import { createClient } from '@/utils/supabase/server'
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'

/**
 * Interface for conversation data
 */
export interface Conversation {
  id: string
  user_id: string
  thread_id: string
  title: string | null
  created_at: string
  updated_at: string
}

/**
 * Interface for conversation message data
 */
export interface ConversationMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata: Record<string, unknown>
  created_at: string
}

/**
 * Create a new conversation
 */
export async function createConversation(
  userId: string,
  threadId: string,
  title?: string
): Promise<Conversation | null> {
  const supabase = await createClient()

  const { data: newConversation, error: createError } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      thread_id: threadId,
      title: title || 'New Conversation',
    })
    .select()
    .single()

  if (createError) {
    console.error('Error creating conversation:', createError)
    return null
  }

  return newConversation as Conversation
}

/**
 * Get or create a conversation by thread_id
 */
export async function getOrCreateConversation(
  userId: string,
  threadId: string,
  title?: string
): Promise<Conversation | null> {
  const supabase = await createClient()

  // Try to find existing conversation
  const { data: existing, error: findError } = await supabase
    .from('conversations')
    .select('*')
    .eq('thread_id', threadId)
    .eq('user_id', userId)
    .single()

  if (existing && !findError) {
    return existing as Conversation
  }

  // Create new conversation if not found
  return await createConversation(userId, threadId, title)
}

/**
 * Load conversation messages from Supabase
 */
export async function loadConversationMessages(
  conversationId: string
): Promise<BaseMessage[]> {
  const supabase = await createClient()

  const { data: messages, error } = await supabase
    .from('conversation_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error loading messages:', error)
    return []
  }

  // Convert to LangChain messages
  return messages.map((msg: { role: string; content: string }) => {
    const content = msg.content
    switch (msg.role) {
      case 'user':
        return new HumanMessage(content)
      case 'assistant':
        return new AIMessage(content)
      case 'system':
        return new SystemMessage(content)
      default:
        return new HumanMessage(content)
    }
  })
}

/**
 * Save a message to Supabase
 */
export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata: Record<string, unknown> = {}
): Promise<ConversationMessage | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('conversation_messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
      metadata,
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving message:', error)
    return null
  }

  return data as ConversationMessage
}

/**
 * Save multiple messages to Supabase
 */
export async function saveMessages(
  conversationId: string,
  messages: BaseMessage[]
): Promise<boolean> {
  const supabase = await createClient()

  const messagesToInsert = messages.map((msg) => {
    let role: 'user' | 'assistant' | 'system' = 'user'
    
    if (msg._getType() === 'human') {
      role = 'user'
    } else if (msg._getType() === 'ai') {
      role = 'assistant'
    } else if (msg._getType() === 'system') {
      role = 'system'
    }

    return {
      conversation_id: conversationId,
      role,
      content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
      metadata: {},
    }
  })

  const { error } = await supabase
    .from('conversation_messages')
    .insert(messagesToInsert)

  if (error) {
    console.error('Error saving messages:', error)
    return false
  }

  return true
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(
  conversationId: string,
  title: string
): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('conversations')
    .update({ title })
    .eq('id', conversationId)

  if (error) {
    console.error('Error updating conversation title:', error)
    return false
  }

  return true
}

/**
 * Update conversation timestamp (updated_at)
 */
export async function updateConversationTimestamp(
  conversationId: string
): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)

  if (error) {
    console.error('Error updating conversation timestamp:', error)
    return false
  }

  return true
}

/**
 * Update conversation title and timestamp
 */
export async function updateConversation(
  conversationId: string,
  updates: { title?: string; updated_at?: boolean }
): Promise<boolean> {
  const supabase = await createClient()

  const updateData: Record<string, string> = {}

  if (updates.title !== undefined) {
    updateData.title = updates.title
  }

  if (updates.updated_at) {
    updateData.updated_at = new Date().toISOString()
  }

  if (Object.keys(updateData).length === 0) {
    return true // No updates needed
  }

  const { error } = await supabase
    .from('conversations')
    .update(updateData)
    .eq('id', conversationId)

  if (error) {
    console.error('Error updating conversation:', error)
    return false
  }

  return true
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) {
    console.error('Error getting user conversations:', error)
    return []
  }

  return data as Conversation[]
}

/**
 * Delete a conversation and all its messages
 */
export async function deleteConversation(conversationId: string): Promise<boolean> {
  const supabase = await createClient()

  // Messages will be deleted automatically due to CASCADE
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId)

  if (error) {
    console.error('Error deleting conversation:', error)
    return false
  }

  return true
}

/**
 * Generate a unique thread ID
 */
export function generateThreadId(): string {
  return `thread_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

