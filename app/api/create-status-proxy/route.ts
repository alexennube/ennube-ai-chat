import { NextResponse } from "next/server"

export async function POST() {
  // This route doesn't actually need to do anything
  // It's just a placeholder to ensure the status-proxy route is deployed
  return NextResponse.json({ success: true, message: "Status proxy route is available" })
}
