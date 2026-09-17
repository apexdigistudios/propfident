import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const APP_ORIGIN = "https://www.propfident.online";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next") ?? "/dashboard";
  const next = requestedNext.startsWith("/") ? requestedNext : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      return NextResponse.redirect(`${APP_ORIGIN}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth-code-error`);
}
