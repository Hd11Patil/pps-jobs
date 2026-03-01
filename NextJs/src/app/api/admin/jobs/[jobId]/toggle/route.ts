import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const job = await db.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    const updatedJob = await db.job.update({
      where: { id: jobId },
      data: {
        isActive: !job.isActive,
      },
    });

    return NextResponse.json({ success: true, job: updatedJob });
  } catch (error) {
    console.error("Error toggling job status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
