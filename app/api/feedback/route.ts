import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAIOutputs } from "@/lib/llm";

export async function POST(req: Request) {
  const { rating, review } = await req.json();

  // Validation
  if (!review || review.trim().length === 0) {
    return NextResponse.json(
      { message: "Review cannot be empty." },
      { status: 400 }
    );
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json(
      { message: "Rating must be between 1 and 5." },
      { status: 400 }
    );
  }

  try {
    // 🔥 LLM call
    const ai = await generateAIOutputs(review, rating);

    await prisma.feedback.create({
      data: {
        rating,
        review,
        aiResponse: ai.user_response,
        aiSummary: ai.admin_summary,
        aiAction: ai.admin_action,
      },
    });

    return NextResponse.json({
      message: ai.user_response,
    });
  } catch (error) {
    console.error("LLM FAILURE:", error);

    // ✅ Fallback so user never sees an error
    const fallbackMessage =
      rating <= 3
        ? "Thank you for your feedback. We’re sorry to hear about your experience and will work to improve our service."
        : "Thank you for your feedback. We appreciate you taking the time to share your experience.";

    await prisma.feedback.create({
      data: {
        rating,
        review,
        aiResponse: fallbackMessage,
        aiSummary: "LLM generation failed. Manual review recommended.",
        aiAction: "Review feedback manually and follow up if needed.",
      },
    });

    return NextResponse.json({
      message: fallbackMessage,
    });
  }
}
