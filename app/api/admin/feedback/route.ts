import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const feedback = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(feedback);
}
