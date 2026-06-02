import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Leonardo.ai Webhook Callback received:", JSON.stringify(body, null, 2));
    
    // Webhook callback response must be 200 OK
    return NextResponse.json({ status: "success", received: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
