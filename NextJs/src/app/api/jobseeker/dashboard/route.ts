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
        skills: true,
        experiences: true,
        applications: true,
      },
    });

    if (!jobSeeker) {
      return NextResponse.json(
        { error: "Job seeker not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      fullName: jobSeeker.fullName,
      currentLocation: jobSeeker.currentLocation,
      preferredLocation: jobSeeker.preferredLocation,
      employmentType: jobSeeker.employmentType,
      profileCompletion: jobSeeker.profileCompletion,
      skills: jobSeeker.skills.map(skill => skill.name),
      experiences: jobSeeker.experiences.length,
      experienceDetails: jobSeeker.experiences,
      appliedJobs: jobSeeker.applications.length,
    });
  } catch (error) {
    console.error("Error fetching job seeker dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
