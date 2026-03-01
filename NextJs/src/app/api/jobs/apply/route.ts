import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = authHeader;
    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

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

    // Check if job exists and is active
    const job = await db.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    if (!job.isActive) {
      return NextResponse.json(
        { error: "This job is no longer active" },
        { status: 400 }
      );
    }

    // Check if already applied
    const existingApplication = await db.application.findUnique({
      where: {
        jobId_jobSeekerId: {
          jobId,
          jobSeekerId: jobSeeker.id,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 400 }
      );
    }

    // Create application
    const application = await db.application.create({
      data: {
        jobId,
        jobSeekerId: jobSeeker.id,
        status: "applied",
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Error applying to job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
