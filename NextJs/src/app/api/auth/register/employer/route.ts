import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyName,
      companyLocation,
      companyAddress,
      companyDomain,
      spocName,
      mobile,
      employeeCount,
      email,
      password,
    } = body;

    // Validate required fields
    if (!companyName || !companyLocation || !spocName || !mobile || !email || !password) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await db.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Check if mobile already exists
    const existingMobile = await db.user.findUnique({
      where: { mobile },
    });

    if (existingMobile) {
      return NextResponse.json(
        { error: "Mobile number already registered" },
        { status: 400 }
      );
    }

    // Create user and employer in a transaction
    const user = await db.user.create({
      data: {
        email,
        mobile,
        password,
        role: "employer",
        isActive: true,
      },
    });

    // Create employer profile
    const employer = await db.employer.create({
      data: {
        userId: user.id,
        companyName,
        companyLocation,
        companyAddress,
        companyDomain,
        spocName,
        mobile,
        employeeCount,
      },
    });

    // Create credit account with 10 free credits valid for 30 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const credit = await db.credit.create({
      data: {
        employerId: employer.id,
        balance: 10,
        expiryDate,
        isFreeCreditsUsed: true,
      },
    });

    // Create credit transaction record
    await db.creditTransaction.create({
      data: {
        creditId: credit.id,
        employerId: employer.id,
        type: "add",
        amount: 10,
        description: "Free credits on registration",
      },
    });

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Employer registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
