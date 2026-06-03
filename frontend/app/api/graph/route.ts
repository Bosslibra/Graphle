import { NextRequest, NextResponse } from "next/server";
import { fetchGraphFromBackend } from "@/lib/api/graph";

export async function GET(request: NextRequest) {
  const seed = request.nextUrl.searchParams.get("seed");
  const data = await fetchGraphFromBackend(seed ?? undefined);
  return NextResponse.json(data);
}