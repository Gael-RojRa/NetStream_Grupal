// src/index.js
import Fastify from 'fastify'
import { createClient } from '@libsql/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const app = Fastify({ logger: true })
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
    const { mediaIds } = req.body
    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      return reply.send([])
    }

    // Prepara placeholders para IN (...)
    const placeholders = mediaIds.map(() => '?').join(',')

    const sql = `
      SELECT media_id,
             MAX(watched)   AS watched,
             MAX(favorite)  AS favorite,
             MAX(watchlist) AS watchlist
      FROM (
        SELECT media_id, 1 AS watched, 0 AS favorite, 0 AS watchlist
        FROM watched
        WHERE user_id = ? AND media_id IN (${placeholders})
        UNION ALL
        SELECT media_id, 0, 1, 0
        FROM favorites
        WHERE user_id = ? AND media_id IN (${placeholders})
        UNION ALL
        SELECT media_id, 0, 0, 1
        FROM watchlist
        WHERE user_id = ? AND media_id IN (${placeholders})
      )
      GROUP BY media_id;
    `

    const args = [
      req.user.sub,
      ...mediaIds,
      req.user.sub,
      ...mediaIds,
      req.user.sub,
      ...mediaIds
    ]

    try {
      const { rows } = await db.execute({ sql, args })
      const statusMap = new Map()
      rows.forEach(r => {
        statusMap.set(r.media_id, {
          watched: Boolean(r.watched),
          favorite: Boolean(r.favorite),
          watchlist: Boolean(r.watchlist)
        })
      })

      const result = mediaIds.map(id => ({
        id,
        ...(statusMap.get(id) || {
          watched: false,
          favorite: false,
          watchlist: false
        })
      }))

      reply.send(result)
    } catch (err) {
      reply.code(500).send({ error: err.message })
    }
  }
)



// Agregar una película a "watched"
app.post(
  '/media/watched',
  { preHandler: auth },
  async (req, reply) => {
    const { media_id } = req.body
    if (!media_id) {
      return reply.code(400).send({ error: 'media_id es requerido' })
    }
    try {
      await db.execute({
        sql: `
          INSERT OR IGNORE INTO watched (user_id, media_id)
          VALUES (?, ?)
        `,
        args: [req.user.sub, media_id]
      })
      reply.send({ id: media_id, watched: true })
    } catch (err) {
      reply.code(500).send({ error: err.message })
    }
  }
)

// Agregar una película a "favorites"
app.post(
  '/media/favorite',
  { preHandler: auth },
  async (req, reply) => {
    const { media_id } = req.body
    if (!media_id) {
      return reply.code(400).send({ error: 'media_id es requerido' })
    }
    try {
      await db.execute({
        sql: `
          INSERT OR IGNORE INTO favorites (user_id, media_id)
          VALUES (?, ?)
        `,
        args: [req.user.sub, media_id]
      })
      reply.send({ id: media_id, favorite: true })
    } catch (err) {
      reply.code(500).send({ error: err.message })
    }
  }
)


app.post(
  '/media/watchlist',
  { preHandler: auth },
  async (req, reply) => {
    const { media_id } = req.body
    if (!media_id) {
      return reply.code(400).send({ error: 'media_id es requerido' })
    }
    try {
      await db.execute({
        sql: `
          INSERT OR IGNORE INTO watchlist (user_id, media_id)
          VALUES (?, ?)
        `,
        args: [req.user.sub, media_id]
      })
      reply.send({ id: media_id, watchlist: true })
    } catch (err) {
      reply.code(500).send({ error: err.message })
    }
  }
)


app.delete(
  '/media/watched',
  { preHandler: auth },
  async (req, reply) => {
    const { media_id } = req.body
    await db.execute({
      sql: `
        DELETE FROM watched
        WHERE user_id = ? AND media_id = ?
      `,
      args: [req.user.sub, media_id]
    })
    reply.send({ id: media_id, watched: false })
  }
)

app.delete(
  '/media/watchlist',
  { preHandler: auth },
  async (req, reply) => {
    const { media_id } = req.body
    await db.execute({
      sql: `
        DELETE FROM watchlist
        WHERE user_id = ? AND media_id = ?
      `,
      args: [req.user.sub, media_id]
    })
    reply.send({ id: media_id, watchlist: false })
  }
)

app.delete(
  '/media/favorite',
  { preHandler: auth },
  async (req, reply) => {
    const { media_id } = req.body
    await db.execute({
      sql: `
        DELETE FROM favorites
        WHERE user_id = ? AND media_id = ?
      `,
      args: [req.user.sub, media_id]
    })
    reply.send({ id: media_id, favorite: false })
  }
)


const port = process.env.PORT || 3000
app.listen({ port }).then(() => {
  console.log(`Servidor corriendo en http://localhost:${port}`)
})