export interface GenerarContenidoIAResponse {
    texto: string
}

export async function generarContenidoIA(prompt: string): Promise<GenerarContenidoIAResponse> {
    const response = await fetch('/api/ia/generar', {
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
