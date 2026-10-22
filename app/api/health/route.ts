import { NextResponse } from "next/server";
import { checkDbConnection } from "@/lib/db";

export async function GET() {
  const dbStatus = await checkDbConnection();
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: {
      type: "PostgreSQL",
      status: dbStatus.connected ? "connected" : "fallback_memory",
      message: dbStatus.message,
    },
    version: "1.0.0",
  });
}
