import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured." },
      { status: 500 }
    );
  }

  let body: { imageBase64: string; mediaType: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { imageBase64, mediaType } = body;
  if (!imageBase64 || !mediaType) {
    return NextResponse.json({ error: "Missing imageBase64 or mediaType." }, { status: 400 });
  }

  const prompt = `You are a contact lens prescription parser. Analyze this prescription image and extract the data into JSON.

Return ONLY valid JSON with this exact structure (use null for any field you cannot confidently read):
{
  "odSphere": "e.g. -3.25 or +1.00",
  "odCylinder": "e.g. -0.75",
  "odAxis": "e.g. 180",
  "odAdd": "e.g. +2.00",
  "odBc": "e.g. 8.5",
  "odDia": "e.g. 14.2",
  "osSphere": "e.g. -2.75",
  "osCylinder": "e.g. -0.50",
  "osAxis": "e.g. 175",
  "osAdd": "e.g. +2.00",
  "osBc": "e.g. 8.5",
  "osDia": "e.g. 14.2",
  "expirationDate": "YYYY-MM-DD format or null",
  "doctorName": "Full name with title e.g. Dr. Jane Smith or null",
  "clinicName": "Practice or clinic name or null",
  "brand": "Contact lens brand if specified e.g. Acuvue or null",
  "modelName": "Contact lens model if specified e.g. Oasys 1-Day or null"
}

Rules:
- Include the sign for sphere and cylinder (e.g. -3.25, +1.00, -0.75)
- OD = right eye, OS = left eye. If the prescription says R/L instead, map accordingly.
- If a field is not present or unreadable, use null — do not guess.
- Return ONLY the JSON object, no explanation.`;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: imageBase64,
              },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    // Strip markdown code fences if Claude wrapped the JSON
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json({ data: parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Parse failed: ${message}` }, { status: 500 });
  }
}
