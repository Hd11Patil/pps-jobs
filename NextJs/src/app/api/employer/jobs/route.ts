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

    // Get jobs with application count
    const jobs = await db.job.findMany({
      where: {
        employerId: employer.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    const jobsWithCount = jobs.map(job => ({
      ...job,
      applicationCount: job._count.applications,
    }));

    return NextResponse.json({ jobs: jobsWithCount });
  } catch (error) {
    console.error("Error fetching employer jobs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    // Check job posting limit (max 4 active jobs)
    const activeJobsCount = await db.job.count({
      where: {
        employerId: employer.id,
        isActive: true,
      },
    });

    if (activeJobsCount >= 4) {
      return NextResponse.json(
        { error: "You have reached maximum job posting limit (4). Please delete an existing job to post a new one." },
        { status: 400 }
      );
    }

    // Create new job
    const job = await db.job.create({
      data: {
        employerId: employer.id,
        title: body.title,
        description: body.description,
        location: body.location,
        requirements: body.requirements,
        salary: body.salary,
        experienceRequired: body.experienceRequired,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
