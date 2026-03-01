import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ experienceId: string }> }
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
    const { experienceId } = await params;

    // Find job seeker by user ID
    const jobSeeker = await db.jobSeeker.findUnique({
      where: { userId },
    });

    if (!jobSeeker) {
      return NextResponse.json(
        { error: "Job seeker not found" },
        { status: 404 }
      );
    }

    // Find experience and verify ownership
    const experience = await db.experience.findUnique({
      where: { id: experienceId },
    });

    if (!experience) {
      return NextResponse.json(
        { error: "Experience not found" },
        { status: 404 }
      );
    }

    if (experience.jobSeekerId !== jobSeeker.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this experience" },
        { status: 403 }
      );
    }

    // Delete experience
    await db.experience.delete({
      where: { id: experienceId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting experience:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
