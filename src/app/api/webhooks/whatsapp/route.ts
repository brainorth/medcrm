import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

/**
 * GET handler: Meta Webhook Verification challenge
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "brainorth_webhook_secret";

  if (mode === "subscribe" && token === expectedToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * POST handler: Meta Webhook Event Notifications (delivery status updates & incoming messages)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is an event from the WhatsApp Business Account
    if (body.object === "whatsapp_business_account") {
      const entries = body.entry || [];

      for (const entry of entries) {
        const changes = entry.changes || [];

        for (const change of changes) {
          const value = change.value;

          // 1. Handle Message Status updates (sent, delivered, read, failed)
          if (value.statuses && Array.isArray(value.statuses)) {
            for (const statusObj of value.statuses) {
              const messageId = statusObj.id; // e.g. "wamid.HBg..."
              const rawStatus = statusObj.status; // "sent" | "delivered" | "read" | "failed"

              let normalizedStatus: "SENT" | "DELIVERED" | "READ" | "FAILED" = "SENT";
              if (rawStatus === "delivered") normalizedStatus = "DELIVERED";
              else if (rawStatus === "read") normalizedStatus = "READ";
              else if (rawStatus === "failed") normalizedStatus = "FAILED";

              // Update the communication record matching externalId
              await db.communication.updateMany({
                where: { externalId: messageId },
                data: {
                  status: normalizedStatus,
                  metadata: {
                    lastStatusUpdate: statusObj,
                  },
                },
              });
            }
          }

          // 2. Handle Inbound Patient Replies (optional 2-way messaging)
          if (value.messages && Array.isArray(value.messages)) {
            for (const incoming of value.messages) {
              console.log("Inbound patient message received:", incoming);
              // Inbound processing can be hooked to clinic inbox or AI triage
            }
          }
        }
      }

      return NextResponse.json({ status: "EVENT_RECEIVED" }, { status: 200 });
    }

    return new NextResponse("Not Found", { status: 404 });
  } catch (error) {
    console.error("Error processing WhatsApp webhook:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

