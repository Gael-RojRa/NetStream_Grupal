// src/index.js
import Fastify from 'fastify'
import { createClient } from '@libsql/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const app = Fastify({ logger: true })

// Registrar el plugin de CORS
await app.register(import('@fastify/cors'), {
  origin: [
    'http://localhost:5173', // Vite dev server
    'http://localhost:4173', // Vite preview
    'http://localhost:3000', // Desarrollo local alternativo
    /^https?:\/\/localhost:\d+$/ // Cualquier puerto localhost
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
})

const db = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_TOKEN
})

// Middleware JWT
async function auth(req, reply) {
  const header = req.headers.authorization
  if (!header) {
    return reply.code(401).send({ error: 'No autorizado' })
  }
  const token = header.split(' ')[1]
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return reply.code(401).send({ error: 'Token inválido' })
  }
}

// Registro de usuario
app.post('/register', async (req, reply) => {
  const { username, password } = req.body
  if (!username || !password) {
    return reply
      .code(400)
      .send({ error: 'Username y password son requeridos' })
  }
  const hashed = await bcrypt.hash(password, 10)
  try {
    await db.execute({
      sql: 'INSERT INTO users (username, password) VALUES (?, ?)',
      args: [username, hashed]
    })
    reply.code(201).send({ message: 'Usuario creado' })
  } catch (err) {
    reply.code(500).send({ error: err.message })
  }
})

// Login y emisión de JWT
app.post('/login', async (req, reply) => {
  const { username, password } = req.body
  if (!username || !password) {
    return reply
      .code(400)
      .send({ error: 'Username y password son requeridos' })
  }
  try {
    const { rows } = await db.execute({
      sql: 'SELECT id, password FROM users WHERE username = ?',
      args: [username]
    })
    if (
      rows.length === 0 ||
      !(await bcrypt.compare(password, rows[0].password))
    ) {
      return reply.code(401).send({ error: 'Credenciales inválidas' })
    }
    const token = jwt.sign(
      { sub: rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )
    reply.send({ token })
  } catch (err) {
    reply.code(500).send({ error: err.message })
  }
})

// Health-check de conexión a Turso
app.get('/health', async (_req, reply) => {
  try {
    const { rows } = await db.execute({ sql: 'SELECT 1 AS ok' })
    reply.send({ db: rows[0]?.ok === 1 })
  } catch (err) {
    reply.code(500).send({ db: false, error: err.message })
  }
})

// Listar usuarios (protegido)
app.get('/users', { preHandler: auth }, async (_req, reply) => {
  try {
    const { rows } = await db.execute({
      sql: 'SELECT id, username FROM users'
    })
    reply.send(rows)
  } catch (err) {
    reply.code(500).send({ error: err.message })
  }
})

// Devuelve, para una lista de IDs, sus flags watched/favorite/watchlist
app.post(
  '/media/status',
  { preHandler: auth },
  async (req, reply) => {
    const { mediaItems } = req.body
    if (!Array.isArray(mediaItems) || mediaItems.length === 0) {
      return reply.send([])
    }

    try {
      const result = []
      
      // Procesamos cada item individualmente para manejar media_id + media_type
      for (const item of mediaItems) {
        const { media_id, media_type } = item
        
        if (!media_id || !media_type) {
          continue // Saltamos elementos inválidos
        }
        
        // Verificamos watched
        const watchedResult = await db.execute({
          sql: 'SELECT 1 FROM watched WHERE user_id = ? AND media_id = ? AND media_type = ?',
          args: [req.user.sub, media_id, media_type]
        })
        
        // Verificamos favorites
        const favoriteResult = await db.execute({
          sql: 'SELECT 1 FROM favorites WHERE user_id = ? AND media_id = ? AND media_type = ?',
          args: [req.user.sub, media_id, media_type]
        })
        
        // Verificamos watchlist
        const watchlistResult = await db.execute({
          sql: 'SELECT 1 FROM watchlist WHERE user_id = ? AND media_id = ? AND media_type = ?',
          args: [req.user.sub, media_id, media_type]
        })
        
        result.push({
          id: media_id,
          type: media_type,
          watched: watchedResult.rows.length > 0,
          favorite: favoriteResult.rows.length > 0,
          watchlist: watchlistResult.rows.length > 0
        })
      }

      reply.send(result)
    } catch (err) {
      reply.code(500).send({ error: err.message })
    }
  }
)

// Agregar una película o serie a "watched"
app.post(
  '/media/watched',
  { preHandler: auth },
  async (req, reply) => {
    const { media_id, media_type } = req.body
    if (!media_id || !media_type) {
      return reply.code(400).send({ error: 'media_id y media_type son requeridos' })
    }
    try {
      await db.execute({
        sql: `
          INSERT OR IGNORE INTO watched (user_id, media_id, media_type)
          VALUES (?, ?, ?)
        `,
        args: [req.user.sub, media_id, media_type]
      })
      reply.send({ id: media_id, type: media_type, watched: true })
    } catch (err) {
      reply.code(500).send({ error: err.message })
    }
  }
)

// Agregar una película o serie a "favorites"
app.post(
  '/media/favorite',
  { preHandler: auth },
  async (req, reply) => {
    const { media_id, media_type } = req.body
    if (!media_id || !media_type) {
      return reply.code(400).send({ error: 'media_id y media_type son requeridos' })
    }
    try {
      await db.execute({
        sql: `
          INSERT OR IGNORE INTO favorites (user_id, media_id, media_type)
          VALUES (?, ?, ?)
        `,
        args: [req.user.sub, media_id, media_type]
      })
      reply.send({ id: media_id, type: media_type, favorite: true })
    } catch (err) {
      reply.code(500).send({ error: err.message })
    }
  }
)

app.post(
  '/media/watchlist',
  { preHandler: auth },
  async (req, reply) => {
    const { media_id, media_type } = req.body
    if (!media_id || !media_type) {
      return reply.code(400).send({ error: 'media_id y media_type son requeridos' })
    }
    try {
      await db.execute({
        sql: `
          INSERT OR IGNORE INTO watchlist (user_id, media_id, media_type)
          VALUES (?, ?, ?)
        `,
        args: [req.user.sub, media_id, media_type]
      })
      reply.send({ id: media_id, type: media_type, watchlist: true })
    } catch (err) {
      reply.code(500).send({ error: err.message })
    }
  }
)

app.delete(
  '/media/watched',
  { preHandler: auth },
  async (req, reply) => {
    const { media_id, media_type } = req.body
    if (!media_id || !media_type) {
      return reply.code(400).send({ error: 'media_id y media_type son requeridos' })
    }
    await db.execute({
      sql: `
        DELETE FROM watched
        WHERE user_id = ? AND media_id = ? AND media_type = ?
      `,
      args: [req.user.sub, media_id, media_type]
    })
    reply.send({ id: media_id, type: media_type, watched: false })
  }
)

app.delete(
  '/media/watchlist',
  { preHandler: auth },
  async (req, reply) => {
    const { media_id, media_type } = req.body
    if (!media_id || !media_type) {
      return reply.code(400).send({ error: 'media_id y media_type son requeridos' })
    }
    await db.execute({
      sql: `
        DELETE FROM watchlist
        WHERE user_id = ? AND media_id = ? AND media_type = ?
      `,
      args: [req.user.sub, media_id, media_type]
    })
    reply.send({ id: media_id, type: media_type, watchlist: false })
  }
)

app.delete(
  '/media/favorite',
  { preHandler: auth },
  async (req, reply) => {
    const { media_id, media_type } = req.body
    if (!media_id || !media_type) {
      return reply.code(400).send({ error: 'media_id y media_type son requeridos' })
    }
    await db.execute({
      sql: `
        DELETE FROM favorites
        WHERE user_id = ? AND media_id = ? AND media_type = ?
      `,
      args: [req.user.sub, media_id, media_type]
    })
    reply.send({ id: media_id, type: media_type, favorite: false })
  }
)

// Obtener lista completa de watchlist
app.get(
  '/media/watchlist',
  { preHandler: auth },
  async (req, reply) => {
    try {
      const { rows } = await db.execute({
        sql: 'SELECT media_id, media_type FROM watchlist WHERE user_id = ?',
        args: [req.user.sub]
      })
      reply.send(rows)
    } catch (err) {
      reply.code(500).send({ error: err.message })
    }
  }
)

// Obtener lista completa de watched
app.get(
  '/media/watched',
  { preHandler: auth },
  async (req, reply) => {
    try {
      const { rows } = await db.execute({
        sql: 'SELECT media_id, media_type FROM watched WHERE user_id = ?',
        args: [req.user.sub]
      })
      reply.send(rows)
    } catch (err) {
      reply.code(500).send({ error: err.message })
    }
  }
)

// Obtener lista completa de favorites
app.get(
  '/media/favorites',
  { preHandler: auth },
  async (req, reply) => {
    try {
      const { rows } = await db.execute({
        sql: 'SELECT media_id, media_type FROM favorites WHERE user_id = ?',
        args: [req.user.sub]
      })
      reply.send(rows)
    } catch (err) {
      reply.code(500).send({ error: err.message })
    }
  }
)

// ==================== EPISODES WATCHED ENDPOINTS ====================

// Marcar un episodio como visto
app.post(
  '/episodes/watched',
  { preHandler: auth },
  async (req, reply) => {
    console.log('📝 Request body recibido:', req.body);
    console.log('📝 User from token:', req.user);
    
    const { series_id, season_number, episode_id, episode_number } = req.body
    
    console.log('📝 Marcando episodio como visto:', { 
      series_id, 
      season_number, 
      episode_id, 
      episode_number, 
      user_id: req.user.sub,
      types: {
        series_id: typeof series_id,
        season_number: typeof season_number,
        episode_id: typeof episode_id,
        episode_number: typeof episode_number
      }
    });
    
    if (!series_id || season_number === undefined || season_number === null || !episode_id || !episode_number) {
      console.log('❌ Faltan parámetros requeridos. Valores recibidos:', {
        series_id: series_id,
        season_number: season_number,
        episode_id: episode_id,
        episode_number: episode_number
      });
      return reply.code(400).send({ 
        error: 'series_id, season_number, episode_id y episode_number son requeridos' 
      })
    }
    
    try {
      const result = await db.execute({
        sql: `
          INSERT OR IGNORE INTO episodes_watched 
          (user_id, series_id, season_number, episode_id, episode_number, watched_at)
          VALUES (?, ?, ?, ?, ?, datetime('now'))
        `,
        args: [req.user.sub, series_id, season_number, episode_id, episode_number]
      })
      
      console.log('✅ Episodio marcado como visto. Cambios:', result.changes);
      
      reply.send({ 
        series_id, 
        season_number, 
        episode_id, 
        episode_number, 
        watched: true 
      })
    } catch (err) {
      console.error('❌ Error al marcar episodio como visto:', err);
      reply.code(500).send({ error: err.message })
    }
  }
)

// Desmarcar un episodio como visto
app.delete(
  '/episodes/watched',
  { preHandler: auth },
  async (req, reply) => {
    const { series_id, episode_id } = req.body
    
    console.log('🗑️ Desmarcando episodio como visto:', { series_id, episode_id, user_id: req.user.sub });
    
    if (!series_id || !episode_id) {
      console.log('❌ Faltan parámetros requeridos');
      return reply.code(400).send({ 
        error: 'series_id y episode_id son requeridos' 
      })
    }
    
    try {
      const result = await db.execute({
        sql: `
          DELETE FROM episodes_watched 
          WHERE user_id = ? AND series_id = ? AND episode_id = ?
        `,
        args: [req.user.sub, series_id, episode_id]
      })
      
      console.log('✅ Episodio desmarcado. Cambios:', result.changes);
      
      reply.send({ 
        series_id, 
        episode_id, 
        watched: false 
      })
    } catch (err) {
      console.error('❌ Error al desmarcar episodio:', err);
      reply.code(500).send({ error: err.message })
    }
  }
)

// Obtener episodios vistos de una serie
app.get(
  '/episodes/watched/:series_id',
  { preHandler: auth },
  async (req, reply) => {
    const { series_id } = req.params
    
    if (!series_id) {
      return reply.code(400).send({ error: 'series_id es requerido' })
    }
    
    try {
      const { rows } = await db.execute({
        sql: `
          SELECT series_id, season_number, episode_id, episode_number, watched_at
          FROM episodes_watched 
          WHERE user_id = ? AND series_id = ?
          ORDER BY season_number, episode_number
        `,
        args: [req.user.sub, series_id]
      })
      
      reply.send(rows)
    } catch (err) {
      reply.code(500).send({ error: err.message })
    }
  }
)

// Obtener progreso de una serie (episodios vistos por temporada)
app.get(
  '/series/progress/:series_id',
  { preHandler: auth },
  async (req, reply) => {
    const { series_id } = req.params
    
    if (!series_id) {
      return reply.code(400).send({ error: 'series_id es requerido' })
    }
    
    try {
      const { rows } = await db.execute({
        sql: `
          SELECT 
            season_number,
            COUNT(*) as watched_episodes
          FROM episodes_watched 
          WHERE user_id = ? AND series_id = ?
          GROUP BY season_number
          ORDER BY season_number
        `,
        args: [req.user.sub, series_id]
      })
      
      reply.send(rows)
    } catch (err) {
      reply.code(500).send({ error: err.message })
    }
  }
)

const port = process.env.PORT || 3000
app.listen({ port }).then(() => {
  console.log(`Servidor corriendo en http://localhost:${port}`)
})