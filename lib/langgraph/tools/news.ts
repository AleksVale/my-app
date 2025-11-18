import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'

// Schema for news tool input
const newsInputSchema = z.object({
  query: z.string().describe('The search query or topic to find news articles about'),
  pageSize: z.number().optional().default(5).describe('Number of articles to return (1-10)'),
})

// Interface for Guardian API response
interface GuardianAPIResponse {
  response: {
    status: string
    total: number
    results: Array<{
      id: string
      type: string
      sectionName: string
      webPublicationDate: string
      webTitle: string
      webUrl: string
      apiUrl: string
      fields?: {
        headline?: string
        trailText?: string
        bodyText?: string
      }
    }>
  }
}

/**
 * Fetches news articles from The Guardian API
 */
async function getNews(query: string, pageSize: number = 5): Promise<string> {
  const apiKey = process.env.GUARDIAN_API_KEY

  if (!apiKey) {
    throw new Error('GUARDIAN_API_KEY is not configured')
  }

  try {
    const url = new URL('https://content.guardianapis.com/search')
    url.searchParams.set('api-key', apiKey)
    url.searchParams.set('q', query)
    url.searchParams.set('page-size', Math.min(Math.max(pageSize, 1), 10).toString())
    url.searchParams.set('show-fields', 'headline,trailText')
    url.searchParams.set('order-by', 'relevance')

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`Guardian API error: ${response.status}`)
    }

    const data: GuardianAPIResponse = await response.json()

    if (data.response.status !== 'ok') {
      throw new Error('Guardian API returned an error status')
    }

    if (!data.response.results || data.response.results.length === 0) {
      return `No news articles found for query: "${query}"`
    }

    // Format the news articles
    let result = `**Latest News: "${query}"**\n\n`
    result += `Found ${data.response.total} articles. Showing top ${data.response.results.length}:\n\n`

    data.response.results.forEach((article, index) => {
      result += `**${index + 1}. ${article.webTitle}**\n`
      result += `*${article.sectionName}* - ${new Date(article.webPublicationDate).toLocaleDateString()}\n`
      
      if (article.fields?.trailText) {
        result += `${article.fields.trailText}\n`
      }
      
      result += `🔗 [Read more](${article.webUrl})\n\n`
    })

    return result
  } catch (error) {
    console.error('Guardian API error:', error)
    if (error instanceof Error) {
      return `Error fetching news: ${error.message}`
    }
    return 'Error fetching news: Unknown error'
  }
}

/**
 * News tool for LangGraph agents
 */
export const newsTool = new DynamicStructuredTool({
  name: 'get_news',
  description: 'Search for news articles from The Guardian on any topic. Use this when users ask about news, current events, or recent information about specific topics.',
  schema: newsInputSchema,
  func: async ({ query, pageSize }) => {
    return await getNews(query, pageSize)
  },
})

export { getNews }

