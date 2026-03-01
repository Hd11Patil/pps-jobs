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
      include: {
        experiences: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!jobSeeker) {
      return NextResponse.json(
        { error: "Job seeker not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ experiences: jobSeeker.experiences });
  } catch (error) {
    console.error("Error fetching experiences:", error);
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

    // Find job seeker by user ID
    const jobSeeker = await db.jobSeeker.findUnique({
      where: { userId },
      include: {
        experiences: true,
      },
    });

    if (!jobSeeker) {
      return NextResponse.json(
        { error: "Job seeker not found" },
        { status: 404 }
      );
    }

    // Check experience limit (max 5)
    if (jobSeeker.experiences.length >= 5) {
      return NextResponse.json(
        { error: "Maximum 5 experience entries allowed" },
        { status: 400 }
      );
    }

    // Create experience
    const experience = await db.experience.create({
      data: {
        jobSeekerId: jobSeeker.id,
        companyName: body.companyName,
        designation: body.designation,
        lastSalary: body.lastSalary,
        dateOfJoining: body.dateOfJoining ? new Date(body.dateOfJoining) : null,
        lastWorkingDate: body.lastWorkingDate ? new Date(body.lastWorkingDate) : null,
        currentlyWorking: body.currentlyWorking || false,
      },
    });

    // Update profile completion
    const newCompletion = Math.min(100, jobSeeker.profileCompletion + 10);
    await db.jobSeeker.update({
      where: { id: jobSeeker.id },
      data: { profileCompletion: newCompletion },
    });

    return NextResponse.json({ success: true, experience });
  } catch (error) {
    console.error("Error creating experience:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
