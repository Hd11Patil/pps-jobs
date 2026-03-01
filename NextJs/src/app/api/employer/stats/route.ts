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

    // For now, we'll get user from header (in production, use proper JWT)
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

    // Get active jobs count
    const activeJobs = await db.job.count({
      where: {
        employerId: employer.id,
        isActive: true,
      },
    });

    // Get total applications
    const applications = await db.application.findMany({
      where: {
        job: {
          employerId: employer.id,
        },
      },
    });

    // Get unlocked profiles count
    const unlockedProfiles = await db.unlock.count({
      where: {
        employerId: employer.id,
      },
    });

    // Get credit balance and expiry
    const credit = await db.credit.findFirst({
      where: {
        employerId: employer.id,
      },
    });

    return NextResponse.json({
      activeJobs,
      totalApplications: applications.length,
      creditBalance: credit?.balance || 0,
      expiryDate: credit?.expiryDate || null,
      unlockedProfiles,
    });
  } catch (error) {
    console.error("Error fetching employer stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
