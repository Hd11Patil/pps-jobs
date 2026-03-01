import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = authHeader;
    const { jobId } = await params;

    // Find employer by user ID
    const employer = await db.employer.findUnique({
      where: { userId },
    });

    if (!employer) {
      return NextResponse.json(
        { error: "Employer not found" },
        { status: 404 }
      );
    }

    // Find job and verify ownership
    const job = await db.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    if (job.employerId !== employer.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this job" },
        { status: 403 }
      );
    }

    // Delete job (applications will be deleted via cascade)
    await db.job.delete({
      where: { id: jobId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
