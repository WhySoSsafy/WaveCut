import { NextResponse } from "next/server";
import { getAllSummaries } from "@/lib/api/aggregate";

export async function GET() {
  return NextResponse.json(await getAllSummaries());
}
