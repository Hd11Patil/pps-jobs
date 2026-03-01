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

    // Verify employer
    const employer = await db.employer.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!employer || employer.user.role !== "employer") {
      return NextResponse.json(
        { error: "Only employers can access this endpoint" },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get("keyword") || "";
    const location = searchParams.get("location") || "";
    const employmentType = searchParams.get("employmentType") || "";
    const skills = searchParams.get("skills") || "";

    // Build where clause for job seekers
    const where: any = {
      user: {
        isActive: true,
      },
    };

    // Add filters
    if (keyword) {
      where.OR = [
        { fullName: { contains: keyword, mode: "insensitive" } },
        { email: { contains: keyword, mode: "insensitive" } },
      ];
    }

    if (location) {
      where.OR = [
        ...(where.OR || []),
        { currentLocation: { contains: location, mode: "insensitive" } },
        { preferredLocation: { contains: location, mode: "insensitive" } },
      ];
    }

    if (employmentType && employmentType !== "all") {
      where.employmentType = employmentType;
    }

    if (skills) {
      where.skills = {
        some: {
          name: {
            contains: skills,
            mode: "insensitive",
          },
        },
      };
    }

    // Fetch job seekers with their details
    const jobSeekers = await db.jobSeeker.findMany({
      where,
      include: {
        skills: true,
        experiences: {
          orderBy: {
            dateOfJoining: "desc",
          },
          take: 1,
        },
        user: {
          select: {
            mobile: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Check which profiles are already unlocked by this employer
    const unlockedIds = await db.unlock
      .findMany({
        where: { employerId: employer.id },
        select: { jobSeekerId: true },
      })
      .then((unlocks) => unlocks.map((u) => u.jobSeekerId));

    // Transform data
    const transformedJobSeekers = jobSeekers.map((js) => ({
      id: js.id,
      fullName: js.fullName,
      email: js.user.email,
      mobile: js.user.mobile,
      currentLocation: js.currentLocation,
      preferredLocation: js.preferredLocation,
      employmentType: js.employmentType,
      profileCompletion: js.profileCompletion,
      skills: js.skills.map((s) => s.name),
      latestExperience: js.experiences[0] || null,
      isUnlocked: unlockedIds.includes(js.id),
      createdAt: js.createdAt,
    }));

    return NextResponse.json({
      jobSeekers: transformedJobSeekers,
      total: transformedJobSeekers.length,
    });
  } catch (error) {
    console.error("Error fetching job seekers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
