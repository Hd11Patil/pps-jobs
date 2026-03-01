import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get total counts
    const totalEmployers = await db.employer.count();
    const totalJobSeekers = await db.jobSeeker.count();
    const totalJobs = await db.job.count();
    const totalUnlocks = await db.unlock.count();

    // Get active and inactive jobs
    const activeJobs = await db.job.count({
      where: { isActive: true },
    });
    const deactivatedJobs = await db.job.count({
      where: { isActive: false },
    });

    // Get credit stats
    const credits = await db.credit.findMany();

    const now = new Date();
    let activeCredits = 0;
    let expiredCredits = 0;

    for (const credit of credits) {
      if (credit.expiryDate && credit.expiryDate < now) {
        expiredCredits += credit.balance;
      } else {
        activeCredits += credit.balance;
      }
    }

    return NextResponse.json({
      totalEmployers,
      totalJobSeekers,
      activeCredits,
      expiredCredits,
      totalJobs,
      activeJobs,
      deactivatedJobs,
      totalUnlocks,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
