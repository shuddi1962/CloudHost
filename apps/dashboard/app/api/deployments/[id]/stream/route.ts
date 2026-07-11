import { NextRequest } from "next/server";
import { emitter } from "@/lib/realtime-emitter";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', deploymentId: id })}\n\n`));

      const unsubscribe = emitter.on(id, (event, data) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: event, ...data })}\n\n`));
      });

      req.signal.addEventListener('abort', () => {
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
