import { NextResponse } from "next/server";
import { resetStore } from "@/lib/db/store";

export async function POST() {
  resetStore();
  return NextResponse.json({ ok: true });
}
