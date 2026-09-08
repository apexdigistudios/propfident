import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const fileName = "Propfident_Playbook_2026.pdf";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const whopApiKey = process.env.WHOP_API_KEY;

  if (!sessionId) {
    return new NextResponse("Unauthorized: Missing payment session ID", { status: 401 });
  }

  if (!supabaseUrl || !serviceRoleKey || !whopApiKey) {
    return new NextResponse("Playbook delivery is not configured", { status: 503 });
  }

  try {
    const whopResponse = await fetch(`https://api.whop.com/v5/payments/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${whopApiKey}` },
      cache: "no-store",
    });
    const paymentData = await whopResponse.json();

    if (!whopResponse.ok || paymentData.status !== "paid") {
      return new NextResponse("Forbidden: Payment not verified", { status: 403 });
    }
  } catch {
    return new NextResponse("Whop verification error", { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabaseAdmin.storage.from("playbooks").download(fileName);

  if (error || !data) {
    return new NextResponse("Error retrieving file from storage", { status: 404 });
  }

  return new NextResponse(Buffer.from(await data.arrayBuffer()), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store, max-age=0",
    },
  });
}