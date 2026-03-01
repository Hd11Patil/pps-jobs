import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
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
        { error: "You don't have permission to view applicants for this job" },
        { status: 403 }
      );
    }

    // Fetch applications with job seeker details
    const applications = await db.application.findMany({
      where: { jobId },
      include: {
        jobSeeker: {
          include: {
            user: {
              select: {
                email: true,
                mobile: true,
              },
            },
            skills: true,
            experiences: {
              orderBy: {
                dateOfJoining: "desc",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Check which profiles are unlocked by this employer
    const unlockedIds = await db.unlock
      .findMany({
        where: { employerId: employer.id },
        select: { jobSeekerId: true },
      })
      .then((unlocks) => unlocks.map((u) => u.jobSeekerId));

    // Transform data
    const transformedApplicants = applications.map((app) => ({
      id: app.id,
      status: app.status,
      appliedAt: app.createdAt,
      jobSeeker: {
        id: app.jobSeeker.id,
        fullName: app.jobSeeker.fullName,
        email: app.jobSeeker.user.email,
        mobile: app.jobSeeker.user.mobile,
        currentLocation: app.jobSeeker.currentLocation,
        preferredLocation: app.jobSeeker.preferredLocation,
        employmentType: app.jobSeeker.employmentType,
        profileCompletion: app.jobSeeker.profileCompletion,
        skills: app.jobSeeker.skills.map((s) => s.name),
        experiences: app.jobSeeker.experiences,
        isUnlocked: unlockedIds.includes(app.jobSeeker.id),
      },
    }));

    return NextResponse.json({
      applicants: transformedApplicants,
      total: transformedApplicants.length,
    });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
