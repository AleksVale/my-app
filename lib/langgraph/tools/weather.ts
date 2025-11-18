import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'

// Schema for weather tool input
const weatherInputSchema = z.object({
  city: z.string().describe('The city name to get weather information for'),
  days: z.number().optional().default(1).describe('Number of days for forecast (1-3)'),
})

// Interface for weather API response
interface WeatherAPIResponse {
  location: {
    name: string
    region: string
    country: string
    localtime: string
  }
  current: {
    temp_c: number
    temp_f: number
    condition: {
      text: string
      icon: string
    }
    wind_kph: number
    humidity: number
    feelslike_c: number
    feelslike_f: number
  }
  forecast?: {
    forecastday: Array<{
      date: string
      day: {
        maxtemp_c: number
        mintemp_c: number
        condition: {
          text: string
        }
        avghumidity: number
      }
    }>
  }
}

/**
 * Fetches weather information from WeatherAPI.com
 */
async function getWeather(city: string, days: number = 1): Promise<string> {
  const apiKey = process.env.WEATHER_API_KEY

  if (!apiKey) {
    throw new Error('WEATHER_API_KEY is not configured')
  }

  try {
    const url = new URL('https://api.weatherapi.com/v1/forecast.json')
    url.searchParams.set('key', apiKey)
    url.searchParams.set('q', city)
    url.searchParams.set('days', Math.min(Math.max(days, 1), 3).toString())
    url.searchParams.set('aqi', 'no')

    const response = await fetch(url.toString())

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      throw new Error(error.error?.message || `Weather API error: ${response.status}`)
    }

    const data: WeatherAPIResponse = await response.json()

    // Format current weather
    let result = `**Weather in ${data.location.name}, ${data.location.country}**\n\n`
    result += `**Current Conditions** (${data.location.localtime}):\n`
    result += `- Temperature: ${data.current.temp_c}°C (${data.current.temp_f}°F)\n`
    result += `- Feels Like: ${data.current.feelslike_c}°C (${data.current.feelslike_f}°F)\n`
    result += `- Condition: ${data.current.condition.text}\n`
    result += `- Humidity: ${data.current.humidity}%\n`
    result += `- Wind: ${data.current.wind_kph} km/h\n`

    // Add forecast if available
    if (data.forecast && data.forecast.forecastday.length > 1) {
      result += `\n**Forecast:**\n`
      data.forecast.forecastday.slice(1).forEach((day) => {
        result += `\n**${day.date}:**\n`
        result += `- High: ${day.day.maxtemp_c}°C / Low: ${day.day.mintemp_c}°C\n`
        result += `- Condition: ${day.day.condition.text}\n`
        result += `- Humidity: ${day.day.avghumidity}%\n`
      })
    }

    return result
  } catch (error) {
    console.error('Weather API error:', error)
    if (error instanceof Error) {
      return `Error fetching weather data: ${error.message}`
    }
    return 'Error fetching weather data: Unknown error'
  }
}

/**
 * Weather tool for LangGraph agents
 */
export const weatherTool = new DynamicStructuredTool({
  name: 'get_weather',
  description: 'Get current weather information and forecast for a specific city. Use this when users ask about weather, temperature, or atmospheric conditions.',
  schema: weatherInputSchema,
  func: async ({ city, days }) => {
    return await getWeather(city, days)
  },
})

export { getWeather }

