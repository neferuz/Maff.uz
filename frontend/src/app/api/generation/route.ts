import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, modelId, width, height, num_images, apiKey } = body;

    const key = apiKey || process.env.LEONARDO_API_KEY;

    if (!key) {
      return NextResponse.json(
        { error: "API key is required. Please set it in the field or .env file." },
        { status: 400 }
      );
    }

    const payload = {
      height: height || 1024,
      width: width || 1024,
      modelId: modelId || "gemini-3.1-flash-image-preview",
      num_images: num_images || 1,
      prompt: prompt
    };

    const response = await fetch("https://cloud.leonardo.ai/api/rest/v1/generations", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": `Bearer ${key}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const apiKey = searchParams.get("apiKey");

    const key = apiKey || process.env.LEONARDO_API_KEY;

    if (!id) {
      return NextResponse.json(
        { error: "Generation ID is required" },
        { status: 400 }
      );
    }

    if (!key) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${id}`, {
      method: "GET",
      headers: {
        "accept": "application/json",
        "authorization": `Bearer ${key}`
      }
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
