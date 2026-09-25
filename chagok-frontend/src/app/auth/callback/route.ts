import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeOAuthCode } from "@/features/auth/oauth";

export async function GET(request: NextRequest) {
  const destination = await exchangeOAuthCode(async () => (await createClient(true)).auth, request.nextUrl.searchParams);
  const target = new URL(destination, request.url);
  // Next may normalize loopback/bind hostnames; retain the incoming authority.
  target.host = request.headers.get("host") ?? target.host;
  const response = NextResponse.redirect(target);
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
