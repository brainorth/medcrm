import { db } from "@/lib/prisma";

export interface SendBillTemplateParams {
  orgId: string;
  patientId: string;
  toPhone: string; // E.164 format, e.g. "+15551234567"
  patientName: string;
  invoiceNumber: string;
  amount: string;
  clinicName: string;
  portalUrl: string;
  pdfUrl?: string;
}

/**
 * Dispatches an automated bill / invoice via WhatsApp Cloud API
 */
export async function sendAutomatedBillWhatsApp(params: SendBillTemplateParams) {
  const {
    orgId,
    patientId,
    toPhone,
    patientName,
    invoiceNumber,
    amount,
    clinicName,
    portalUrl,
    pdfUrl,
  } = params;

  const cleanPhone = toPhone.replace(/[^0-9]/g, "");

  // Meta WhatsApp Cloud API credentials
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  // Construct Meta template payload
  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanPhone,
    type: "template",
    template: {
      name: "bill_issued_v1",
      language: {
        code: "en_US",
      },
      components: [
        ...(pdfUrl
          ? [
              {
                type: "header",
                parameters: [
                  {
                    type: "document",
                    document: {
                      link: pdfUrl,
                      filename: `Invoice_${invoiceNumber}.pdf`,
                    },
                  },
                ],
              },
            ]
          : []),
        {
          type: "body",
          parameters: [
            { type: "text", text: patientName },
            { type: "text", text: invoiceNumber },
            { type: "text", text: amount },
            { type: "text", text: clinicName },
            { type: "text", text: portalUrl },
          ],
        },
      ],
    },
  };

  let externalId: string | null = null;
  let status: "QUEUED" | "SENT" | "FAILED" = "QUEUED";

  if (phoneNumberId && accessToken) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (response.ok && data.messages?.[0]?.id) {
        externalId = data.messages[0].id;
        status = "SENT";
      } else {
        console.error("WhatsApp Cloud API error response:", data);
        status = "FAILED";
      }
    } catch (error) {
      console.error("Failed to connect to WhatsApp Cloud API:", error);
      status = "FAILED";
    }
  }

  // Persist communication record in the database
  try {
    const record = await db.communication.create({
      data: {
        orgId,
        patientId,
        channel: "WHATSAPP",
        direction: "OUTBOUND",
        templateName: "bill_issued_v1",
        messageBody: `Invoice #${invoiceNumber} of ${amount} sent to ${patientName}`,
        mediaUrl: pdfUrl || null,
        status,
        externalId,
        metadata: payload,
      },
    });

    return record;
  } catch (dbErr) {
    console.error("Failed to log communication record:", dbErr);
    return null;
  }
}

