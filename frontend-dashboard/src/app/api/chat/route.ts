import { convertToModelMessages, streamText, UIMessage } from "ai";
import { ollama } from "@/lib/ollama";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages }: { messages?: UIMessage[] } = await req.json();
    const safeMessages = Array.isArray(messages) ? messages : [];

    const result = streamText({
      model: ollama("gemma3:4b"),
      system:
        "Eres un asistente corporativo experto disenado para gestionar tareas del equipo de Oracle Cloud. Responde siempre en espanol.",
      messages: await convertToModelMessages(safeMessages),
    });

    return result.toUIMessageStreamResponse({
      originalMessages: safeMessages,
      onError: () => "Ocurrio un error al generar la respuesta.",
    });
  } catch (error) {
    console.error("Error en la comunicacion:", error);

    return Response.json(
      { error: "Fallo en el servidor." },
      { status: 500 },
    );
  }
}
