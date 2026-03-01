import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = authHeader;

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

    // Get all applications with job details
    const applications = await db.application.findMany({
      where: {
        jobSeekerId: jobSeeker.id,
      },
      include: {
        job: {
          include: {
            employer: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format response
    const jobs = applications.map((app) => ({
      id: app.id,
      jobTitle: app.job.title,
      companyName: app.job.employer.companyName,
      jobLocation: app.job.location,
      status: app.status,
      salary: app.job.salary,
      experienceRequired: app.job.experienceRequired,
      appliedDate: app.createdAt,
      jobUrl: `/jobs`,
    }));

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
