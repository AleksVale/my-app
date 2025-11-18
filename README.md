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

### 5. Set Up Supabase

1. Create a project at [Supabase](https://supabase.com/)
2. Get your project URL and anon key from the project settings
3. Add them to your `.env.local` file
4. Generate TypeScript types (optional):
   ```bash
   npm run generate:types
   ```

### 6. Run Development Server

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

## API Routes

### `/api/chat`
Streaming AI chat endpoint using Vercel AI SDK with LangSmith observability.

### `/api/chat/tools`
AI chat endpoint with tools support and LangSmith tracing.

### `/api/agents`
LangGraph agent execution endpoint for complex agent workflows.

## Usage Examples

### Using AI Chat Hook

```tsx
'use client'
import { useAIChat } from '@/lib/ai/hooks'

export default function ChatComponent() {
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

## Deploy on Vercel

1. Push your code to a Git repository
2. Import your project on [Vercel](https://vercel.com/new)
3. Add your environment variables in the Vercel dashboard
4. Deploy!

The project is configured for optimal Vercel deployment with serverless functions.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [LangGraph Documentation](https://langgraph.dev/docs)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [LangSmith Documentation](https://docs.smith.langchain.com/)
- [LangSmith Vercel Integration](https://docs.smith.langchain.com/observability/integrations/vercel)
