import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Файл обязателен" }, { status: 400 });
    }

    const key = process.env.LEONARDO_API_KEY;
    if (!key) {
      return NextResponse.json(
        { error: "API key is not configured on the server." },
        { status: 500 }
      );
    }

    // Map MIME type to extension
    const mimeToExt: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const ext = mimeToExt[file.type] || "jpg";

    // 1. Get presigned upload URL from Leonardo
    const initResponse = await fetch("https://cloud.leonardo.ai/api/rest/v1/init-image", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({ extension: ext.replace("jpeg", "jpg") }),
    });

    const initData = await initResponse.json();
    if (!initResponse.ok) {
      return NextResponse.json(
        { error: initData.error || initData.message || "Ошибка при запросе URL загрузки" },
        { status: initResponse.status }
      );
    }

    const uploadData = initData.uploadInitImage;
    if (!uploadData) {
      return NextResponse.json(
        { error: "Неверная структура ответа от Leonardo" },
        { status: 500 }
      );
    }

    const { id, url, fields } = uploadData;

    // Leonardo returns `fields` as a JSON string, parse it
    const parsedFields = typeof fields === "string" ? JSON.parse(fields) : fields;

    // 2. Read file bytes and create fresh Blob for S3 upload
    const fileBytes = await file.arrayBuffer();
    const fileBlob = new Blob([fileBytes], { type: file.type });

    const s3Form = new FormData();
    // Add fields first, file LAST (S3 requirement)
    Object.entries(parsedFields).forEach(([k, v]) => {
      s3Form.append(k, String(v));
    });
    s3Form.append("file", fileBlob, file.name);

    const s3Response = await fetch(url, {
      method: "POST",
      body: s3Form,
    });

    if (!s3Response.ok && s3Response.status !== 204) {
      const s3Text = await s3Response.text();
      console.error("S3 upload error:", s3Response.status, s3Text);
      return NextResponse.json(
        { error: `Ошибка загрузки на S3: ${s3Response.status}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ id }, { status: 200 });
  } catch (error: any) {
    console.error("Upload proxy error:", error);
    return NextResponse.json({ error: error.message || "Ошибка загрузки" }, { status: 500 });
  }
}
