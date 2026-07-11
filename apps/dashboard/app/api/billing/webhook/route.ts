import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let event;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }
    const { type } = event;
    switch (type) {
      case "checkout.session.completed":
        console.log("Webhook received: checkout.session.completed", event.data?.object?.id);
        break;
      case "invoice.paid":
        console.log("Webhook received: invoice.paid", event.data?.object?.id);
        break;
      case "customer.subscription.updated":
        console.log("Webhook received: customer.subscription.updated", event.data?.object?.id);
        break;
      case "customer.subscription.deleted":
        console.log("Webhook received: customer.subscription.deleted", event.data?.object?.id);
        break;
      default:
        console.log("Webhook received unhandled event type:", type);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    return handleApiError(error);
  }
}
