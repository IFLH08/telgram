import { Router } from 'express'
import { GoogleGenAI } from '@google/genai'

const router = Router()

const apiKey = process.env.GEMINI_API_KEY
const model = process.env.DEEPSEEK_CHAT_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash'

if (!apiKey) {
    console.warn('⚠️ GEMINI_API_KEY no está definida en el entorno.')
}

const ai = new GoogleGenAI({
    apiKey: apiKey ?? '',
})

router.post('/generar', async (req, res) => {
    try {
        const { prompt } = req.body as { prompt?: string }

        if (!apiKey) {
            return res.status(500).json({
                error: 'Falta configurar GEMINI_API_KEY en el backend.',
            })
        }

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({
                error: 'El prompt es obligatorio.',
            })
        }

        const response = await ai.models.generateContent({
            model,
            contents: prompt.trim(),
        })

        return res.json({
            texto: response.text ?? '',
        })
    } catch (error) {
        console.error('Error en /api/ia/generar:', error)

        return res.status(500).json({
            error: 'No se pudo generar contenido con Gemini.',
        })
    }
})

export default router
