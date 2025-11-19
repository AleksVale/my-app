'use client'

import { useState } from 'react'
import { Conversation } from '@/lib/langgraph/persistence'

interface ConversationSidebarProps {
  conversations: Conversation[]
  currentConversationId: string | null
  onConversationSelect: (conversationId: string) => void
  onNewConversation: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  loading?: boolean
}

export function ConversationSidebar({
  conversations,
  currentConversationId,
  onConversationSelect,
  onNewConversation,
  isCollapsed,
  onToggleCollapse,
  loading = false
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = conversations.filter(conversation =>
    conversation.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.thread_id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <>
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
        transition-all duration-300 ease-in-out z-20
        ${isCollapsed ? 'w-16' : 'w-80'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Conversations
            </h2>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${isCollapsed ? 'rotate-180' : ''
                }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* New Conversation Button */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          {!isCollapsed ? (
            <button
              onClick={onNewConversation}
              className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Chat
            </button>
          ) : (
            <button
              onClick={onNewConversation}
              className="w-full flex justify-center p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="New Chat"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          )}
        </div>

        {/* Search */}
        {!isCollapsed && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              {!isCollapsed && <p className="text-sm text-gray-500 dark:text-gray-400">Loading conversations...</p>}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center">
              {!isCollapsed ? (
                <div>
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No conversations yet</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Start a new chat to begin</p>
                </div>
              ) : (
                <svg className="w-6 h-6 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              )}
            </div>
          ) : (
            <div className="p-2">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => onConversationSelect(conversation.id)}
                  className={`
                    w-full text-left p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 mb-1
                    ${currentConversationId === conversation.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }
                  `}
                  title={isCollapsed ? conversation.title || 'Untitled' : undefined}
                >
                  <div className="flex items-start gap-3">
                    <svg
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${currentConversationId === conversation.id
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-400 dark:text-gray-500'
                        }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${currentConversationId === conversation.id
                            ? 'text-blue-900 dark:text-blue-100'
                            : 'text-gray-900 dark:text-white'
                          }`}>
                          {conversation.title || 'Untitled Conversation'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(conversation.updated_at)}
                        </p>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile (when sidebar is expanded) */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={onToggleCollapse}
        />
      )}
    </>
  )
}
