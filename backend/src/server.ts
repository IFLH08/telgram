import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import iaRoutes from './routes/ia.routes.js'

const app = express()
const PORT = Number(process.env.PORT) || 3001
const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : ['http://localhost:5173', 'http://localhost:5174']

app.use(
    cors({
        origin: allowedOrigins,
    }),
)

app.use(express.json())

app.get('/api/health', (_req, res) => {
    res.json({
        ok: true,
        message: 'Backend de DevTask activo',
    })
})

app.use('/api/ia', iaRoutes)

app.listen(PORT, () => {
    console.log(`🚀 Backend corriendo en http://localhost:${PORT}`)
})