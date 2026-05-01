import { Hono } from 'hono'
import { cors } from 'hono/cors'
import chatRoutes from './routes/chat.js'
import rescuerRoutes from './routes/rescuers.js'

const app = new Hono()

app.use(
  '*',
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)

app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))
app.route('/api/chat', chatRoutes)
app.route('/api/rescuers', rescuerRoutes)
app.all('*', (c) => c.json({ error: 'Not Found' }, 404))

export default app
