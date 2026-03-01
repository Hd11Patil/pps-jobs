import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      mobile,
      currentLocation,
      preferredLocation,
      employmentType,
      password,
    } = body;

    // Validate required fields
    if (!fullName || !mobile || !currentLocation || !employmentType || !password) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      );
    }

    // Check if email already exists
    if (email) {
      const existingEmail = await db.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }
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

    // Create user and job seeker
    const user = await db.user.create({
      data: {
        email: email || null,
        mobile,
        password,
        role: "jobseeker",
        isActive: true,
      },
    });

    // Calculate initial profile completion
    let completion = 0;
    if (fullName) completion += 20;
    if (currentLocation) completion += 20;
    if (preferredLocation) completion += 10;
    if (employmentType) completion += 10;

    // Create job seeker profile
    const jobSeeker = await db.jobSeeker.create({
      data: {
        userId: user.id,
        fullName,
        email: email || null,
        mobile,
        currentLocation,
        preferredLocation,
        employmentType,
        profileCompletion: completion,
      },
    });

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Job seeker registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
