import { NextResponse } from "next/server";
import { getBeachDetail } from "@/lib/api/aggregate";
import { BEACH_IDS } from "@/lib/data/fallback";
import type { BeachId } from "@/lib/data/fallback";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(BEACH_IDS as readonly string[]).includes(id)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(await getBeachDetail(id as BeachId));
}
