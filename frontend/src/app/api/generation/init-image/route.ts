import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { extension } = body;

    const key = process.env.LEONARDO_API_KEY;

    if (!key) {
      return NextResponse.json(
        { error: "API key is not configured on the server." },
        { status: 500 }
      );
    }

    if (!extension) {
      return NextResponse.json(
        { error: "File extension is required (e.g. png, jpg, jpeg)" },
        { status: 400 }
      );
    }

    const response = await fetch("https://cloud.leonardo.ai/api/rest/v1/init-image", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
        extension: extension.toLowerCase().replace("jpeg", "jpg")
      })
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
