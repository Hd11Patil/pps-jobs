import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get all employers with their credit balances
    const credits = await db.credit.findMany({
      include: {
        employer: {
          select: {
            id: true,
            companyName: true,
            companyLocation: true,
            mobile: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format response
    const creditData = credits.map((credit) => ({
      id: credit.id,
      employerId: credit.employerId,
      companyName: credit.employer.companyName,
      companyLocation: credit.employer.companyLocation,
      balance: credit.balance,
      expiryDate: credit.expiryDate,
      isFreeCreditsUsed: credit.isFreeCreditsUsed,
    }));

    return NextResponse.json({ credits: creditData });
  } catch (error) {
    console.error("Error fetching credits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employerId, amount, type, description } = body;

    if (!employerId || !amount || !type) {
      return NextResponse.json(
        { error: "Employer ID, amount, and type are required" },
        { status: 400 }
      );
    }

    if (!["add", "deduct"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be 'add' or 'deduct'" },
        { status: 400 }
      );
    }

    // Find employer's credit account
    let credit = await db.credit.findFirst({
      where: {
        employerId,
      },
    });

    if (!credit) {
      // Create credit account if it doesn't exist
      credit = await db.credit.create({
        data: {
          employerId,
          balance: 0,
          isFreeCreditsUsed: false,
        },
      });
    }

    // Calculate new balance
    let newBalance: number;
    if (type === "add") {
      newBalance = credit.balance + amount;
    } else {
      newBalance = credit.balance - amount;
      if (newBalance < 0) {
        return NextResponse.json(
          { error: "Insufficient credits to deduct" },
          { status: 400 }
        );
      }
    }

    // Update credit balance
    const updatedCredit = await db.credit.update({
      where: {
        id: credit.id,
      },
      data: {
        balance: newBalance,
      },
    });

    // Create credit transaction
    await db.creditTransaction.create({
      data: {
        creditId: credit.id,
        employerId,
        type,
        amount,
        description: description || `Manual ${type} by admin`,
      },
    });

    return NextResponse.json({
      success: true,
      credit: updatedCredit,
    });
  } catch (error) {
    console.error("Error managing credits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
