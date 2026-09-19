import { NextResponse, type NextRequest } from "next/server";

import { exchangeStravaCode } from "@/lib/actions/strava";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(`${origin}/fitness?strava_error=${encodeURIComponent(oauthError)}`);
  }
  if (!code) {
    return NextResponse.redirect(`${origin}/fitness?strava_error=${encodeURIComponent("Missing authorization code")}`);
  }

  const result = await exchangeStravaCode(code);
  if (result?.error) {
    return NextResponse.redirect(`${origin}/fitness?strava_error=${encodeURIComponent(result.error)}`);
  }

  return NextResponse.redirect(`${origin}/fitness?strava_connected=1`);
}
