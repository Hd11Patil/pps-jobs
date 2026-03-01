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
    const { jobSeekerId } = body;

    if (!jobSeekerId) {
      return NextResponse.json(
        { error: "Job seeker ID is required" },
        { status: 400 }
      );
    }

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

    // Get employer's credit balance
    const credit = await db.credit.findFirst({
      where: {
        employerId: employer.id,
      },
    });

    if (!credit || credit.balance < 1) {
      return NextResponse.json(
        { error: "Insufficient credits. Please purchase more credits to unlock profiles." },
        { status: 400 }
      );
    }

    // Check if already unlocked
    const existingUnlock = await db.unlock.findUnique({
      where: {
        employerId_jobSeekerId: {
          employerId: employer.id,
          jobSeekerId,
        },
      },
    });

    if (existingUnlock) {
      return NextResponse.json(
        { error: "This profile is already unlocked" },
        { status: 400 }
      );
    }

    // Create unlock record
    await db.unlock.create({
      data: {
        employerId: employer.id,
        jobSeekerId,
      },
    });

    // Deduct credit
    await db.credit.update({
      where: {
        id: credit.id,
      },
      data: {
        balance: credit.balance - 1,
      },
    });

    // Create credit transaction
    await db.creditTransaction.create({
      data: {
        creditId: credit.id,
        employerId: employer.id,
        type: "unlock",
        amount: 1,
        description: `Unlocked job seeker profile`,
        referenceId: jobSeekerId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unlocking profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
