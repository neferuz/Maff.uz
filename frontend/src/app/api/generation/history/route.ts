import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Locate history.json file in the root of the project to ensure persistence across builds/HMR
const historyFilePath = path.join(process.cwd(), "generation_history.json");

function readHistory(): any[] {
  try {
    if (fs.existsSync(historyFilePath)) {
      const data = fs.readFileSync(historyFilePath, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading generation history file:", err);
  }
  return [];
}

function writeHistory(history: any[]) {
  try {
    fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing generation history file:", err);
  }
}

export async function GET() {
  const history = readHistory();
  return NextResponse.json(history);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { images } = body; // Array of GeneratedImage items
    if (!images || !Array.isArray(images)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const currentHistory = readHistory();
    // Prepend new items to history, limit to 100 items
    const updatedHistory = [...images, ...currentHistory].slice(0, 100);
    writeHistory(updatedHistory);

    return NextResponse.json({ success: true, history: updatedHistory });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    writeHistory([]);
    return NextResponse.json({ success: true, history: [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
