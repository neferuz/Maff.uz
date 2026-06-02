import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, initImageId } = body;

    const key = process.env.LEONARDO_API_KEY;

    if (!key) {
      return NextResponse.json(
        { error: "API key is not configured on the server." },
        { status: 500 }
      );
    }

    // Set model, nested parameters, and 1:1 ratio size (1024x1024)
    const parameters: any = {
      width: 1024,
      height: 1024,
      prompt: prompt,
      quantity: 1,
      style_ids: [
        "111dc692-d470-4eec-b791-3475abac4c46" // Dynamic style preset
      ],
      prompt_enhance: "OFF"
    };

    if (initImageId) {
      parameters.guidances = {
        image_reference: [
          {
            image: {
              id: initImageId,
              type: "UPLOADED"
            },
            strength: "MID"
          }
        ]
      };
    }

    const payload = {
      model: "nano-banana-2",
      parameters: parameters,
      public: false
    };

    const response = await fetch("https://cloud.leonardo.ai/api/rest/v2/generations", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": `Bearer ${key}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    // Convert v2 response keys to format expected by frontend
    // v2 returns: {"generate":{"generationId":"..."}}
    // v1 returns: {"sdGenerationJob":{"generationId":"..."}}
    const mappedData = {
      sdGenerationJob: {
        generationId: data.generate?.generationId || data.sdGenerationJob?.generationId
      }
    };
    
    return NextResponse.json(mappedData, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const key = process.env.LEONARDO_API_KEY;

    if (!id) {
      return NextResponse.json(
        { error: "Generation ID is required" },
        { status: 400 }
      );
    }

    if (!key) {
      return NextResponse.json(
        { error: "API key is not configured on the server." },
        { status: 500 }
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
