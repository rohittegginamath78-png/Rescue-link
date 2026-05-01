import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

export async function* streamChatMessage(message, animal, conversationHistory) {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      animal,
      conversationHistory,
    }),
  })

  if (!response.ok) {
    let payload
    try {
      payload = await response.json()
    } catch {
      payload = null
    }
    throw new Error(payload?.error || 'Failed to get chat response')
  }

  if (!response.body) {
    throw new Error('Streaming is not supported in this browser')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const events = buffer.split('\n\n')
      buffer = events.pop() || ''

      for (const eventText of events) {
        const dataLine = eventText.split('\n').find((line) => line.startsWith('data: '))
        if (!dataLine) continue

        const payload = dataLine.slice(6).trim()
        if (!payload) continue

        yield JSON.parse(payload)
      }
    }
  } finally {
    reader.releaseLock()
  }
}

export async function fetchRescuers(city, specialty = null) {
  const params = { city }
  if (specialty) {
    params.specialty = specialty
  }
  const response = await api.get('/api/rescuers', { params })
  return response.data
}

export async function fetchCitiesWithRescuers() {
  const response = await api.get('/api/rescuers/cities')
  return response.data
}

export async function submitRescuerForm(data) {
  const response = await api.post('/api/rescuers', data)
  return response.data
}

export default api
