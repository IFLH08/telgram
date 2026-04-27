export interface GenerarContenidoIAResponse {
    texto: string
}

export async function generarContenidoIA(prompt: string): Promise<GenerarContenidoIAResponse> {
    const nodeBackendUrl = import.meta.env.VITE_NODE_BACKEND_URL || 'http://localhost:3001'
    const response = await fetch(`${nodeBackendUrl}/api/ia/generar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data?.error || 'Error al generar contenido con IA')
    }

    return data
}