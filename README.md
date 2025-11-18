This is a [Next.js](https://nextjs.org) project with Supabase, LangGraph, and Vercel AI SDK integration.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **Supabase** - Database, authentication, and real-time features
- **LangGraph** - AI agent orchestration framework
- **Vercel AI SDK** - AI streaming and chat utilities
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini Configuration
GOOGLE_API_KEY=your_google_api_key

# LangSmith Configuration (for observability)
LANGSMITH_API_KEY=your_langsmith_api_key
LANGSMITH_PROJECT=your_project_name
LANGSMITH_TRACING=true

# WeatherAPI.com Configuration (for weather agent)
WEATHER_API_KEY=your_weather_api_key

# The Guardian API Configuration (for news agent)
GUARDIAN_API_KEY=your_guardian_api_key

# Database (optional, if using direct connection)
DATABASE_URL=your_database_connection_string
```

### 3. Set Up Google Gemini API

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey) or [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new API key for Gemini
3. Add the `GOOGLE_API_KEY` to your `.env.local` file
4. The project uses `gemini-1.5-flash` model by default (faster and more cost-effective)

### 4. Set Up LangSmith (Optional but Recommended)

1. Sign up at [LangSmith](https://smith.langchain.com/)
2. Get your API key from the settings
3. Create a project or use an existing one
4. Add the following to your `.env.local`:
   - `LANGSMITH_API_KEY` - Your LangSmith API key
   - `LANGSMITH_PROJECT` - Your project name
   - `LANGSMITH_TRACING=true` - Enable tracing
5. All AI SDK calls will automatically be traced in LangSmith

### 5. Set Up WeatherAPI.com (for Weather Agent)

1. Sign up at [WeatherAPI.com](https://www.weatherapi.com/)
2. Get your free API key from the dashboard
3. Add `WEATHER_API_KEY` to your `.env.local` file

### 6. Set Up The Guardian API (for News Agent)

1. Sign up at [The Guardian Open Platform](https://open-platform.theguardian.com/)
2. Register for an API key
3. Add `GUARDIAN_API_KEY` to your `.env.local` file

### 7. Set Up Supabase

1. Create a project at [Supabase](https://supabase.com/)
2. Get your project URL and anon key from the project settings
3. Add them to your `.env.local` file
4. Generate TypeScript types (optional):
   ```bash
   npm run generate:types
   ```

### 8. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
my-app/
├── app/
│   ├── api/
│   │   ├── chat/          # AI chat endpoint with streaming
│   │   └── agents/        # LangGraph agent execution endpoint
│   ├── page.tsx
│   └── layout.tsx
├── lib/
│   ├── supabase/          # Supabase client setup
│   │   ├── client.ts      # Browser client
│   │   ├── server.ts      # Server client
│   │   ├── middleware.ts  # Session management
│   │   └── database.types.ts
│   ├── langgraph/         # LangGraph agent definitions
│   │   ├── agent.ts
│   │   └── types.ts
│   └── ai/                # Vercel AI SDK utilities
│       ├── utils.ts
│       └── hooks.ts
├── middleware.ts          # Next.js middleware for Supabase
└── vercel.json           # Vercel deployment configuration
```

## Features

### 🤖 Dual Chat Modes

**Simple Chat Mode**
- Direct AI responses using Google Gemini
- Fast, streaming responses
- Perfect for general conversations

**Agent Chat Mode** (New! 🎉)
- Multi-agent system powered by LangGraph
- Specialized agents for different tasks:
  - **Weather Agent**: Real-time weather data from WeatherAPI.com
  - **News Agent**: Latest news from The Guardian
  - **General Agent**: Conversational AI for everything else
- Intelligent routing based on query intent
- Full conversation persistence with Supabase
- LangSmith observability for all agent interactions

## API Routes

### `/api/chat`
Streaming AI chat endpoint using Vercel AI SDK with LangSmith observability.

### `/api/agent-chat` (New!)
Multi-agent chat endpoint powered by LangGraph. Features:
- Supervisor-based routing to specialized agents
- Tool usage for weather and news queries
- Conversation persistence with thread management
- Full LangSmith tracing and observability

### `/api/chat/tools`
AI chat endpoint with tools support and LangSmith tracing.

### `/api/agents`
LangGraph agent execution endpoint for complex agent workflows.

## Usage Examples

### Using Simple Chat Hook

```tsx
'use client'
import { useAIChat } from '@/lib/ai/hooks'

export default function SimpleChatComponent() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useAIChat()

  return (
    <form onSubmit={handleSubmit}>
      <input value={input} onChange={handleInputChange} />
      <button type="submit" disabled={isLoading}>
        Send
      </button>
      {messages.map((m) => (
        <div key={m.id}>{m.role}: {m.content}</div>
      ))}
    </form>
  )
}
```

### Using Agent Chat Hook (New!)

```tsx
'use client'
import { useAgentChat } from '@/lib/ai/hooks'

export default function AgentChatComponent() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, threadId } = useAgentChat()

  return (
    <div>
      <p>Thread ID: {threadId}</p>
      <form onSubmit={handleSubmit}>
        <input 
          value={input} 
          onChange={handleInputChange}
          placeholder="Try: What's the weather in London?"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Send'}
        </button>
      </form>
      {messages.map((m) => (
        <div key={m.id}>{m.role}: {m.content}</div>
      ))}
    </div>
  )
}
```

### Using Supabase Client

```tsx
import { createClient } from '@/lib/supabase/server'

export default async function ServerComponent() {
  const supabase = await createClient()
  const { data } = await supabase.from('table').select()
  return <div>{JSON.stringify(data)}</div>
}
```

### Using AI Chat with Tools

```tsx
// Example API call with tools
const response = await fetch('/api/chat/tools', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'What is the weather in San Francisco?' }
    ]
  })
})

const result = await response.json()
// All calls are automatically traced in LangSmith
```

## Multi-Agent Architecture

The LangGraph multi-agent system uses a supervisor pattern to route queries to specialized agents:

```
User Query
    ↓
Supervisor Node (Intent Analysis)
    ↓
    ├─→ Weather Agent → Weather Tool (WeatherAPI.com)
    ├─→ News Agent → News Tool (The Guardian API)
    └─→ General Agent → Conversational AI
    ↓
Response Synthesis
    ↓
User
```

### Agent Capabilities

**Supervisor**
- Analyzes user intent using Gemini
- Routes to appropriate specialized agent(s)
- Can coordinate multiple agents for complex queries

**Weather Agent**
- Fetches real-time weather data
- Provides current conditions and forecasts
- Formats data in user-friendly markdown

**News Agent**
- Searches The Guardian's article database
- Returns relevant news with summaries and links
- Handles topical queries about current events

**General Agent**
- Handles conversational queries
- Provides explanations and general information
- Fallback for queries not requiring tools

### Persistence Strategy

**LangGraph Checkpointing** (Active Sessions)
- In-memory state management using `MemorySaver`
- Maintains conversation context during active sessions
- Thread-based conversation tracking

**Supabase** (Long-term Storage)
- Permanent storage of all conversations and messages
- User-specific conversation history
- Enables conversation resumption and analytics

## Database Schema

Run the migration in `lib/supabase/migrations/001_conversations.sql` to create:

**conversations table**
- `id`: UUID primary key
- `user_id`: References auth.users
- `thread_id`: Unique conversation identifier
- `title`: Conversation title
- `created_at`, `updated_at`: Timestamps

**conversation_messages table**
- `id`: UUID primary key
- `conversation_id`: References conversations
- `role`: user | assistant | system
- `content`: Message text
- `metadata`: JSONB for additional data
- `created_at`: Timestamp

Both tables have Row Level Security (RLS) policies ensuring users only access their own data.

## Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing instructions including:

- Weather query test cases
- News query test cases
- Multi-agent scenarios
- Conversation persistence verification
- LangSmith observability checks
- Troubleshooting guide

Example test queries:
- "What's the weather in London?"
- "Latest news about AI"
- "Weather in NYC and news about climate change"

## Deploy on Vercel

1. Push your code to a Git repository
2. Import your project on [Vercel](https://vercel.com/new)
3. Add your environment variables in the Vercel dashboard:
   - All Supabase keys
   - `GOOGLE_API_KEY`
   - `WEATHER_API_KEY`
   - `GUARDIAN_API_KEY`
   - `LANGSMITH_API_KEY` and related vars (optional)
4. Deploy!

The project is configured for optimal Vercel deployment with serverless functions.

**Note:** Agent chat requires `nodejs` runtime (already configured in `app/api/agent-chat/route.ts`)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [LangGraph Documentation](https://langgraph.dev/docs)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [LangSmith Documentation](https://docs.smith.langchain.com/)
- [LangSmith Vercel Integration](https://docs.smith.langchain.com/observability/integrations/vercel)
